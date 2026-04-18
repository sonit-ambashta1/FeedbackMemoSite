import matplotlib.pyplot as plt
import numpy as np
import joblib
import os
import torch
from datasets import load_dataset

# models
from sentence_transformers import SentenceTransformer
from sklearn.linear_model import LogisticRegression
from sklearn.svm import LinearSVC

# preprocessing and evaluation
from sklearn.feature_extraction.text import CountVectorizer, TfidfVectorizer
from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    f1_score,
    ConfusionMatrixDisplay
)

from setfit import SetFit, SetFitHead
from setfit.losses import SupConLoss

# -----------------------------
# Paths
# -----------------------------
BASE_DIR = os.path.dirname(__file__)

DATASETS_DIR = os.path.join(BASE_DIR, "datasets")
PLOTS_DIR = os.path.join(BASE_DIR, "plots")
MODEL_DIR = os.path.join(BASE_DIR, "models")
EMBEDDINGS_DIR = os.path.join(BASE_DIR, "embeddings")

os.makedirs(PLOTS_DIR, exist_ok=True)
os.makedirs(MODEL_DIR, exist_ok=True)
os.makedirs(EMBEDDINGS_DIR, exist_ok=True)


# -----------------------------
# Dataset
# -----------------------------
def read_dataset():
    ds = load_dataset("Yelp/yelp_review_full", cache_dir=DATASETS_DIR)
    return ds["train"], ds["test"]


# -----------------------------
# Device selection (important fix)
# -----------------------------
def get_device():
    if torch.cuda.is_available():
        return "cuda"
    elif torch.backends.mps.is_available():
        return "mps"
    return "cpu"


# -----------------------------
# Vectorization
# -----------------------------
def vectorize_data(train_df, test_df, model_name="all-MiniLM-L6-v2"):
    is_text_embedding_model = model_name not in [
        "countvectorizer",
        "tfidfvectorizer"
    ]

    # -------------------------
    # TF-IDF / Count baseline
    # -------------------------
    if not is_text_embedding_model:
        if model_name == "countvectorizer":
            vectorizer = CountVectorizer(max_features=5000)
        else:
            vectorizer = TfidfVectorizer(max_features=5000)

        X_train = vectorizer.fit_transform(train_df["text"])
        X_test = vectorizer.transform(test_df["text"])

        return X_train, train_df["label"], X_test, test_df["label"], vectorizer

    # -------------------------
    # SentenceTransformer (MiniLM etc.)
    # -------------------------
    
    # check if embeddings already exist to avoid recomputation (important for development iteration speed)
    embedding_train_path = os.path.join(EMBEDDINGS_DIR, f"{model_name}_X_train.npy")
    embedding_test_path = os.path.join(EMBEDDINGS_DIR, f"{model_name}_X_test.npy")
    if os.path.exists(embedding_train_path) and os.path.exists(embedding_test_path):
        print(f"[INFO] Loading existing embeddings for {model_name}...")
        X_train = np.load(embedding_train_path)
        X_test = np.load(embedding_test_path)
        return X_train, train_df["label"], X_test, test_df["label"], None
    
    device = get_device()
    print(f"[INFO] Using device: {device}")

    model = SentenceTransformer(model_name, device=device)

    train_texts = train_df["text"]
    test_texts = test_df["text"]

    X_train = model.encode(
        train_texts,
        batch_size=96,
        normalize_embeddings=True,
        show_progress_bar=True
    )

    X_test = model.encode(
        test_texts,
        batch_size=96,
        normalize_embeddings=True,
        show_progress_bar=True
    )

    # Save embeddings properly (no overwrites)
    np.save(os.path.join(EMBEDDINGS_DIR, f"{model_name}_X_train.npy"), X_train)
    np.save(os.path.join(EMBEDDINGS_DIR, f"{model_name}_X_test.npy"), X_test)

    return X_train, train_df["label"], X_test, test_df["label"], None


# -----------------------------
# Model
# -----------------------------
def train_model(model_name, X_train, y_train):
    if model_name == "logistic_regression":
        model = LogisticRegression(max_iter=1000)
    elif model_name == "svm":
        model = LinearSVC(
            C=1.0,
            loss="squared_hinge",
            dual=True,
            max_iter=3000,
            class_weight="balanced"
        )
    else:
        raise ValueError(f"Unknown model name: {model_name}")
    model.fit(X_train, y_train)
    return model


# -----------------------------
# Evaluation
# -----------------------------
def evaluate_model(training_model_name, model_name, model, X_test, y_test):
    y_pred = model.predict(X_test)

    print(classification_report(y_test, y_pred))

    matrix = confusion_matrix(y_test, y_pred)
    print("Confusion Matrix:\n", matrix)
    print("F1 Score:", f1_score(y_test, y_pred, average="weighted"))

    disp = ConfusionMatrixDisplay(confusion_matrix=matrix)
    disp.plot(cmap="Blues")

    plt.title(f"Confusion Matrix - {model_name}")
    plt.savefig(os.path.join(PLOTS_DIR, f"confusion_matrix_{training_model_name}_{model_name}.png"))
    plt.close()


# -----------------------------
# Save model
# -----------------------------
def save_model(model, model_name):
    joblib.dump(model, os.path.join(MODEL_DIR, f"{model_name}.pkl"))


def save_vectorizer(vectorizer, model_name):
    if vectorizer is not None:
        joblib.dump(vectorizer, os.path.join(MODEL_DIR, f"{model_name}_vectorizer.pkl"))


# -----------------------------
# Main experiment loop
# -----------------------------
def main():
    train_df, test_df = read_dataset()

    models_to_run = [
        "countvectorizer",
        "tfidfvectorizer",
        "all-MiniLM-L6-v2"
    ]
    
    training_models = [
        "logistic_regression",
        "svm"
    ]

    for model_name in models_to_run:
        print(f"\n========== Running: {model_name} ==========")

        X_train, y_train, X_test, y_test, vectorizer = vectorize_data(
            train_df,
            test_df,
            model_name=model_name
        )

        if model_name == "all-MiniLM-L6-v2":
            for training_model in training_models:
                print(f"\n--- Training {training_model} on {model_name} embeddings ---")
                model = train_model(training_model, X_train, y_train)
                evaluate_model(training_model, model_name, model, X_test, y_test)
                save_model(model, model_name)
            
            save_vectorizer(vectorizer, model_name)


if __name__ == "__main__":
    main()