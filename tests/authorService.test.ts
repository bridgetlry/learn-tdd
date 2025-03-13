import request from "supertest";
import Author from "../models/author";
import app from "../server";


describe("Verify GET /authors", () => {
    const mockAuthors = [
        { name: "Tagore, Robi", lifespan: "1900 - 2000" },
        { name: "Austen, Jane", lifespan: "1950 - 2010" },
        { name: "Ghosh, Amitav", lifespan: "1980 - 2020" },
        { name: "Plath, Sylvia", lifespan: "1927 - 1964" },
    ];
    let consoleSpy: jest.SpyInstance;

    beforeAll(() => {
        consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    });

    afterAll(() => {
        consoleSpy.mockRestore();
    });

    it("should respond with a message when there are no authors in the database", async () => {
        Author.getAllAuthors = jest.fn().mockResolvedValue([]);
        const response = await request(app).get("/authors");
        expect(response.statusCode).toBe(200);
        expect(response.text).toBe("No authors found");
    })

    it("should respond with a list of author names and lifespans sorted by family name", async () => {
        const expectedSortedAuthors = [...mockAuthors].sort((a, b) => a.name.localeCompare(b.name));
        Author.getAllAuthors = jest.fn().mockImplementationOnce((sortOps) => {
            if (sortOps && sortOps.family_name === 1) {
                return Promise.resolve(expectedSortedAuthors);
            }
            return Promise.resolve(mockAuthors)
        });
        const response = await request(app).get("/authors");
        expect(response.statusCode).toBe(200);
        expect(expectedSortedAuthors).toStrictEqual(response.body);
    })

    it("should respond with 500 if error occurs", async () => {
        Author.getAllAuthors = jest.fn().mockRejectedValue(new Error("Database error"));
        const response = await request(app).get("/authors");
        expect(response.statusCode).toBe(500);
        expect(consoleSpy).toHaveBeenCalled();
    });
})