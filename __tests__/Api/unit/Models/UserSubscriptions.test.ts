import { sequelize } from "../../../../src/database/sequelize.config";
import { User } from "../../../../src/api/models/user";
import { UserSubscriptions } from "../../../../src/api/models/users-subscription";
import crypto from "crypto";


let subsId = crypto.randomUUID();
let userId = crypto.randomUUID();
let cusId = crypto.randomUUID();
describe("UserSubscription Model", () => {
    beforeAll(async () => {
        await sequelize.sync({ force: true }); // Sync the model with the database and create tables
        await User.create({
            id: userId,
            authId: "auth" + userId,
            email: "example@example2.com",
            emailVerified: true,
            picture: null,
            name: "John",
            lastName: "Doe",
            secondLastName: "Smith",
            age: 25,
            address: "123 Street",
        });
        await UserSubscriptions.create({
            id: subsId,
            userId: userId,
            customerId: cusId,
            renewDate: new Date(),
        });
    });

    afterAll(async () => {
        const userT = await User.findByPk(userId);
        const subsT = await UserSubscriptions.findByPk(subsId);
        if (subsT) 
            await subsT.destroy();
        if(userT)
            await userT.destroy();
        await sequelize.close();
    });

/*     beforeEach(async () => {}); 
    afterEach(async () => {}); */

    it("should create a subscription", async () => {
        const user = await User.create({
            id: "f8d2b728-c483-4868-aac1-6281f59b583b",
            authId: "subscriptionauth",
            email: "examplesubs@example.com",
            emailVerified: true,
            picture: null,
            name: "John",
            lastName: "Doe",
            secondLastName: "Smith",
            age: 25,
            address: "123 Street",
        });
        const subscription = await UserSubscriptions.create({
            id: "f8d2b728-c483-4868-aac1-6281f59b584b", // Cambia el ID
            userId: "f8d2b728-c483-4868-aac1-6281f59b583b",
            customerId: "f8d2b728-c483-4868-aac1-6281f59b584b", // Cambia el customerId
            renewDate: new Date(),
        });

        expect(subscription.dataValues.createdAt).toBeTruthy();
        expect(subscription.dataValues.updatedAt).toBeTruthy();
    });

    it("should update a userSubscription", async () => {
        const subscription = await UserSubscriptions.findByPk(subsId);

        await subscription!.update({
            customerId : "mycustomer"
        });

        const updatedSubscription = await UserSubscriptions.findByPk(subsId);
        expect(updatedSubscription!.dataValues.customerId).toBe("mycustomer");
    });
    it("should delete a userSubscription", async () => {
        const subscription = await UserSubscriptions.findByPk(subsId);

        await subscription!.destroy();

        const deletedSubscription = await UserSubscriptions.findByPk(subsId);
        expect(deletedSubscription).toBeNull();
    });
});
