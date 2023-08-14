import { sequelize } from "../../../../src/database/database.config";
import { User } from "../../../../src/api/models/user";
import { UserFiles } from "../../../../src/api/models/user-file";
import { DataTypes } from "sequelize";

describe("User Model", () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true }); // Sync the model with the database and create tables
  });

  afterAll(async () => {
    await sequelize.close(); // Close the database connection after all tests are finished
  });

  it("should create a user", async () => {
    const user = await User.create({
      id: "f8d2b728-c483-4868-aac1-6281f59b584a",
      authId: "auth123",
      email: "example@example.com",
      emailVerified : true,
      picture : null,
      name: "John",
      lastName: "Doe",
      secondLastName: "Smith",
      age: 25,
      address: "123 Street",
    });

    expect(user.id).toBe("f8d2b728-c483-4868-aac1-6281f59b584a");
    expect(user.authId).toBe("auth123");
    expect(user.email).toBe("example@example.com");
    expect(user.emailVerified).toBe(true);
    expect(user.picture).toBeNull();
    expect(user.name).toBe("John");
    expect(user.lastName).toBe("Doe");
    expect(user.secondLastName).toBe("Smith");
    expect(user.age).toBe(25);
    expect(user.address).toBe("123 Street");
  });

  it("should update a user", async () => {
    const user = await User.findByPk("f8d2b728-c483-4868-aac1-6281f59b584a");

    if (user) {
      user.name = "Jane";
      user.age = 30;
      await user.save();

      expect(user.name).toBe("Jane");
      expect(user.age).toBe(30);
    }
  });

  it("should delete a user", async () => {
    const user = await User.findByPk("f8d2b728-c483-4868-aac1-6281f59b584a");

    if (user) {
      await user.destroy();
    }

    const deletedUser = await User.findByPk("1");
    expect(deletedUser).toBeNull();
  });
});
