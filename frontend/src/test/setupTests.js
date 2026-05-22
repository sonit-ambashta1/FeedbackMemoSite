import "@testing-library/jest-dom";
import { server } from "./mocks/server";

// Start MSW before all tests and clean up/restore handlers after
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
