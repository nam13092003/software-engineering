import { v4 as uuid } from "uuid";
import { initDatabase } from "../data/database";
import { userRepository, bookRepository } from "../config/container";
import { hashPassword } from "../utils/password";

async function seed() {
  await initDatabase();

  const adminEmail = "admin@library.local";
  const admin = await userRepository.findByEmail(adminEmail);
  if (!admin) {
    const passwordHash = await hashPassword("Admin@123");
    await userRepository.create({
      id: uuid(),
      name: "System Admin",
      email: adminEmail,
      passwordHash,
      role: "ADMIN"
    });
    console.log("[seed] Created default admin account (admin@library.local / Admin@123)");
  } else {
    console.log("[seed] Admin account already exists");
  }

  const existingBooks = await bookRepository.listAll();
  if (existingBooks.length === 0) {
    await bookRepository.create({
      id: uuid(),
      title: "Clean Code",
      author: "Robert C. Martin",
      genre: "Software",
      isbn: "9780132350884",
      totalCopies: 5,
      availableCopies: 5,
      description: "A handbook of agile software craftsmanship"
    });
    await bookRepository.create({
      id: uuid(),
      title: "The Pragmatic Programmer",
      author: "Andrew Hunt, David Thomas",
      genre: "Software",
      isbn: "9780201616224",
      totalCopies: 3,
      availableCopies: 3,
      description: "Classic guide to programming craftsmanship"
    });
    await bookRepository.create({
      id: uuid(),
      title: "Atomic Habits",
      author: "James Clear",
      genre: "Self-help",
      isbn: "9780735211292",
      totalCopies: 4,
      availableCopies: 4,
      description: "How to build good habits and break bad ones"
    });
    console.log("[seed] Seeded sample books");
  } else {
    console.log("[seed] Books already seeded");
  }
}

seed()
  .then(() => {
    console.log("[seed] Completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("[seed] Failed", error);
    process.exit(1);
  });
