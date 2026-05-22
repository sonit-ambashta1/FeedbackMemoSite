import { rest } from "msw";

export const handlers = [
  rest.get("http://localhost:8000/auth/me", (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        id: 1,
        username: "sonit",
      })
    );
  }),
];
