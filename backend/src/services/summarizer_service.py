from src.repositories.feedback_repo import FeedbackRepository
import numpy as np
import math

class SummarizerService:
    def __init__(self, feedback_repo: FeedbackRepository):
        self.feedback_repo = feedback_repo

    def validate_feedback_count(self, user_id: int, min_entries: int):
        return self.feedback_repo.get_feedback_count_by_user(user_id) >= min_entries
    
    # choose samples for feedback data (initially do random but diversity)
    def choose_to_sample(self, user_id: int, scaling_factor: float, min_entries: int) -> list[str]:
        if scaling_factor > 1 or scaling_factor < 0:
            raise ValueError("Scaling factor must be between 0 and 1.")
        if not self.validate_feedback_count(user_id, min_entries):
            raise ValueError("User does not have enough feedback to sample")

        categories = self.feedback_repo.get_feedback_categories_for_user(user_id)
        category_counts = self.feedback_repo.get_category_counts(user_id)
        print(category_counts)

        normalized_counts = {entry[0]: max(math.floor(entry[1]*scaling_factor), 1) for entry in category_counts}
        
        pool = []
        for category in categories:
            category_feedback = self.feedback_repo.get_feedback_by_category_for_user(user_id, category)
            num_samples = min(len(category_feedback), normalized_counts[category])
            if num_samples > 1:
                chosen = np.random.choice(np.asarray(category_feedback), num_samples).tolist()
                pool.extend(chosen)
            else:
                pool.append(category_feedback[0])
        return pool