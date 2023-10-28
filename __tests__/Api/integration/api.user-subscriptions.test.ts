import request from "supertest";
import app from "../../../src/api/server";
import { sequelize } from "../../../src/database/sequelize.config.js";
import { User } from "../../../src/api/models/user";
import {getTestToken, configureEnvv} from "../utils/generateTestPayload";
/* DONT CHANGE TO IMPORT !!!! */
const authDependency =  require("../../../src/api/middlewares/Authorization/AuthorizationMiddleware");
import { JsonWebTokenError } from "jsonwebtoken";
import { UserSubscriptions } from "../../../src/api/models/users-subscription";
import { addDays } from "../utils/dates";


// Mock the "database.js" module that imports Sequelize
//change environment to test
describe("Integration Tests for users subcriptions", () => {
beforeAll(async () =>{
    //process.env.EXPRESS_SERVER_PORT = "80";
    configureEnvv();
    //token= configureEnv.token as unknown as string;
    await sequelize.sync();
    

},5000)
beforeEach(()=>{
    authDependency.expressAuthentication = jest.fn().mockImplementation((request, securityScope, scopes?)=>
    {
        //We will send token docoded cause of test purpose
        const token = request.headers["authorization"];

        return new Promise((resolve, reject) =>{
            if(!token)
            reject(new JsonWebTokenError("Not token found"))
            const decoded = JSON.parse(token?.split(" ")[1]);
            if (decoded.aud != process.env.AUTH0_AUDIENCE_USERS) {
                reject(new JsonWebTokenError("UnAuthorized 1"));
            }
            if (decoded.iss != `https://${process.env.AUTH0_DOMAIN}/`) {
                reject(new JsonWebTokenError("UnAuthorized 2"));
            }
            if(scopes && scopes!.length !== 0)
            {
                for (let scope of scopes!) {
                if (!decoded.scope || !decoded.scope.includes(scope)) {
                    reject(new JsonWebTokenError("Unauthorized 3"));
                }
                }
            }
            resolve(decoded);
        })
    })
});
beforeEach(async ()=>{
    const userSubscriptions = {
        id : "bc5cb2e9-c310-4f77-9e9b-cf147621da8a",
        authId : "bc5cb2e9-c310-4f77-9e9b-cf147621da8a",
        email : "emailtests@gmail.com",
        emailVerified : true, 
        picture : "pictureUrl",
        name: "John",
        lastName: "Doe",
        secondLastName: "Doe2",
        age : 50, 
        address : "Address example"
    }
    const subscription = {
        id:"bf154652-ce07-4941-aa71-0c431cd085f6",
        userId : "bc5cb2e9-c310-4f77-9e9b-cf147621da8a",
        customerId : "customertest321-beaten",
        renewDate : new Date().toISOString().split("T")[0],
        description : "PLUS SUBSCRIPTION"
    }
        await User.create(userSubscriptions);
        await UserSubscriptions.create(subscription);
    })
    afterEach(async ()=>{
        await UserSubscriptions.destroy({where:{userId:"bc5cb2e9-c310-4f77-9e9b-cf147621da8a"}});
        await User.destroy({where:{id:"bc5cb2e9-c310-4f77-9e9b-cf147621da8a"}});
    })
  /* ENDPOINT GET USER BY ID */
    test("WithUserId_GetUserSubscriptions_SuccessAndSubscriptions", async () => {
        const scopes = ["read:users"]
        const userId = "bc5cb2e9-c310-4f77-9e9b-cf147621da8a"
        const token = JSON.stringify(getTestToken(scopes));
        const expected = {
            id:"bf154652-ce07-4941-aa71-0c431cd085f6",
            userId : "bc5cb2e9-c310-4f77-9e9b-cf147621da8a",
            customerId : "customertest321-beaten",
            renewDate : new Date().toISOString().split("T")[0],
            description : "PLUS SUBSCRIPTION"
        }


        const response = await request(app).get(`/api/v1/users/${userId}/subscriptions`).
        set("Authorization", `Bearer ${token}`);
        const bodyResponse = response["body"]

        //First check dates that had happend same date no exactly time
        expect(new Date(bodyResponse[0].createdAt).toISOString().split("T")[0]).toEqual(new Date().toISOString().split("T")[0]);
        expect(new Date(bodyResponse[0].updatedAt).toISOString().split("T")[0]).toEqual(new Date().toISOString().split("T")[0]);
        expect(authDependency.expressAuthentication).toHaveBeenCalledTimes(1);
        expect(response.status).toBe(200);
        expect(bodyResponse[0].id).toEqual(expected.id);
        expect(bodyResponse[0].userId).toEqual(expected.userId);
        expect(bodyResponse[0].customerId).toEqual(expected.customerId);
        expect(bodyResponse[0].renewDate).toEqual(expected.renewDate);
        expect(bodyResponse[0].description).toEqual(expected.description);



    });
    test("WithUserIdWithoutToken_GetUserSubscriptions_Forbidden", async () => {
        const userId = "bc5cb2e9-c310-4f77-9e9b-cf147621da8a"

        const response = await request(app).get(`/api/v1/users/${userId}/subscriptions`);
        
        expect(authDependency.expressAuthentication).toHaveBeenCalledTimes(1);
        expect(response.status).toBe(401);
    });
    test("WithUserIdTokenWioutPermissions_GetUserSubscriptions_Forbidden", async () => {
        const scopes = ["fake:scope"]
        const userId = "bc5cb2e9-c310-4f77-9e9b-cf147621da8a"
        const token = JSON.stringify(getTestToken(scopes));

        const response = await request(app).get(`/api/v1/users/${userId}/subscriptions`).
        set("Authorization", `Bearer ${token}`);
        
        expect(authDependency.expressAuthentication).toHaveBeenCalledTimes(1);
        expect(response.status).toBe(401);
    });
    test("WithUserId_GetUserSubscriptions_SuccessAndSubscriptions", async () => {
        const scopes = ["read:users"]
        const userId = "bc5cb2e9-c310-4f77-9e9b-cf147621da8a"
        const token = JSON.stringify(getTestToken(scopes));
        const expected = {
            id:"bf154652-ce07-4941-aa71-0c431cd085f6",
            userId : "bc5cb2e9-c310-4f77-9e9b-cf147621da8a",
            customerId : "customertest321-beaten",
            renewDate : new Date().toISOString().split("T")[0],
            description : "PLUS SUBSCRIPTION"
        }


        const response = await request(app).get(`/api/v1/users/${userId}/subscriptions`).
        set("Authorization", `Bearer ${token}`);
        const bodyResponse = response["body"]

        //First check dates that had happend same date no exactly time
        expect(new Date(bodyResponse[0].createdAt).toISOString().split("T")[0]).toEqual(new Date().toISOString().split("T")[0]);
        expect(new Date(bodyResponse[0].updatedAt).toISOString().split("T")[0]).toEqual(new Date().toISOString().split("T")[0]);
        expect(authDependency.expressAuthentication).toHaveBeenCalledTimes(1);
        expect(response.status).toBe(200);
        expect(bodyResponse[0].id).toEqual(expected.id);
        expect(bodyResponse[0].userId).toEqual(expected.userId);
        expect(bodyResponse[0].customerId).toEqual(expected.customerId);
        expect(bodyResponse[0].renewDate).toEqual(expected.renewDate);
        expect(bodyResponse[0].description).toEqual(expected.description);



    });
    test("WithUserIdWithoutToken_GetUserSubscriptions_Forbidden", async () => {
        const userId = "bc5cb2e9-c310-4f77-9e9b-cf147621da8a"

        const response = await request(app).get(`/api/v1/users/${userId}/subscriptions`);
        
        expect(authDependency.expressAuthentication).toHaveBeenCalledTimes(1);
        expect(response.status).toBe(401);
    });
    test("WithUserIdTokenWioutPermissions_GetUserSubscriptions_Forbidden", async () => {
        const scopes = ["fake:scope"]
        const userId = "bc5cb2e9-c310-4f77-9e9b-cf147621da8a"
        const token = JSON.stringify(getTestToken(scopes));

        const response = await request(app).get(`/api/v1/users/${userId}/subscriptions`).
        set("Authorization", `Bearer ${token}`);
        
        expect(authDependency.expressAuthentication).toHaveBeenCalledTimes(1);
        expect(response.status).toBe(401);
    });
    test("WithUserId_PostUserSubscriptions_SuccessAndSubscriptions", async () => {
        const scopes = ["create:profiles"]
        const userId = "bc5cb2e9-c310-4f77-9e9b-cf147621da8a"
        const token = JSON.stringify(getTestToken(scopes));
        const subscription = {
            userId : "bc5cb2e9-c310-4f77-9e9b-cf147621da8a",
            customerId : "customertest321-beaten-2",
            renewDate : new Date().toISOString().split("T")[0],
            description : "X SUBSCRIPTION"
        }

        const response = await request(app).post(`/api/v1/users/${userId}/subscriptions`).
        send(subscription).
        set("Authorization", `Bearer ${token}`);
        const subscriptionAdded  = response["body"]
        //const subscriptionAdded = bodyResponse.find(s=> s.customerId ===subscription.customerId);
        
        expect(authDependency.expressAuthentication).toHaveBeenCalledTimes(1);
        expect(response.status).toBe(200);
        expect(new Date(subscriptionAdded!.createdAt).toISOString().split("T")[0]).toEqual(new Date().toISOString().split("T")[0]);
        expect(new Date(subscriptionAdded!.updatedAt).toISOString().split("T")[0]).toEqual(new Date().toISOString().split("T")[0]);
        expect(subscriptionAdded!.id).toBeTruthy();
        expect(subscriptionAdded!.userId).toEqual(subscription.userId);
        expect(subscriptionAdded!.customerId).toEqual(subscription.customerId);
        expect(subscriptionAdded!.renewDate).toEqual(subscription.renewDate);
        expect(subscriptionAdded!.description).toEqual(subscription.description);

    });
    test("WithUserIdWithoutToken_PostUserSubscriptions_Forbidden", async () => {
        const userId = "bc5cb2e9-c310-4f77-9e9b-cf147621da8a"

        const response = await request(app).post(`/api/v1/users/${userId}/subscriptions`);
        
        expect(authDependency.expressAuthentication).toHaveBeenCalledTimes(1);
        expect(response.status).toBe(401);
    });
    test("WithUserIdTokenWioutPermissions_GetUserSubscriptions_Forbidden", async () => {
        const scopes = ["fake:scope"]
        const userId = "bc5cb2e9-c310-4f77-9e9b-cf147621da8a"
        const token = JSON.stringify(getTestToken(scopes));

        const response = await request(app).post(`/api/v1/users/${userId}/subscriptions`).
        set("Authorization", `Bearer ${token}`);
        
        expect(authDependency.expressAuthentication).toHaveBeenCalledTimes(1);
        expect(response.status).toBe(401);
    });
    // Patch endpont
    test("WithUserId_PatchUserSubscriptions_SuccessAndSubscriptions", async () => {
        const scopes = ["create:profiles"];
        const userId = "bc5cb2e9-c310-4f77-9e9b-cf147621da8a";
        const token = JSON.stringify(getTestToken(scopes));
        const customerId = "customertest321-beaten";
        const subscription = {
            renewDate : addDays(new Date(), 20).toISOString().split("T")[0],
            description : "new description"
        }

        const response = await request(app).patch(`/api/v1/users/${userId}/subscriptions/${customerId}`).
        send(subscription).
        set("Authorization", `Bearer ${token}`);
        const subscriptionPatched  = response["body"]
        //const subscriptionAdded = bodyResponse.find(s=> s.customerId ===subscription.customerId);
        
        expect(authDependency.expressAuthentication).toHaveBeenCalledTimes(1);
        expect(response.status).toBe(200);
        expect(new Date(subscriptionPatched!.createdAt).toISOString().split("T")[0]).toEqual(new Date().toISOString().split("T")[0]);
        expect(new Date(subscriptionPatched!.updatedAt).toISOString().split("T")[0]).toEqual(new Date().toISOString().split("T")[0]);
        expect(subscriptionPatched!.id).toBeTruthy();
        expect(subscriptionPatched!.userId).toEqual(userId);
        expect(subscriptionPatched!.customerId).toEqual(customerId);
        expect(subscriptionPatched!.renewDate).toEqual(subscription.renewDate);
        expect(subscriptionPatched!.description).toEqual(subscription.description);

    });
    test("WithUserIdWithoutToken_PostUserSubscriptions_Forbidden", async () => {
        const userId = "bc5cb2e9-c310-4f77-9e9b-cf147621da8a"
        const customerId = "customertest321-beaten";

        const response = await request(app).patch(`/api/v1/users/${userId}/subscriptions/${customerId}`);
        
        expect(authDependency.expressAuthentication).toHaveBeenCalledTimes(1);
        expect(response.status).toBe(401);
    });
    test("WithUserIdTokenWioutPermissions_GetUserSubscriptions_Forbidden", async () => {
        const scopes = ["fake:scope"]
        const userId = "bc5cb2e9-c310-4f77-9e9b-cf147621da8a"
        const customerId = "customertest321-beaten";
        const token = JSON.stringify(getTestToken(scopes));

        const response = await request(app).patch(`/api/v1/users/${userId}/subscriptions/${customerId}`).
        set("Authorization", `Bearer ${token}`);
        
        expect(authDependency.expressAuthentication).toHaveBeenCalledTimes(1);
        expect(response.status).toBe(401);
    });

});
