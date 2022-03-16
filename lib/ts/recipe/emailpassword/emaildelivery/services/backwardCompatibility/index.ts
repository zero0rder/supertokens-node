/* Copyright (c) 2021, VRAI Labs and/or its affiliates. All rights reserved.
 *
 * This software is licensed under the Apache License, Version 2.0 (the
 * "License") as published by the Apache Software Foundation.
 *
 * You may not use this file except in compliance with the License. You may
 * obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 */
import { TypeEmailPasswordEmailDeliveryInput, User } from "../../../types";
import { User as EmailVerificationUser } from "../../../../emailverification/types";
import { createAndSendCustomEmail as defaultCreateAndSendCustomEmail } from "../../../passwordResetFunctions";
import { NormalisedAppinfo } from "../../../../../types";
import Recipe from "../../../recipe";
import { BackwardCompatibilityService as EmailVerificationBackwardCompatibilityService } from "../../../../emailverification/emaildelivery/services";
import { EmailDeliveryInterface } from "../../../../../ingredients/emaildelivery/types";

export default class BackwardCompatibilityService
    implements EmailDeliveryInterface<TypeEmailPasswordEmailDeliveryInput> {
    private recipeInstance: Recipe;
    private appInfo: NormalisedAppinfo;
    private resetPasswordUsingTokenFeature?: {
        createAndSendCustomEmail?: (user: User, passwordResetURLWithToken: string, userContext: any) => Promise<void>;
    };
    private emailVerificationFeature?: {
        createAndSendCustomEmail?: (
            user: User,
            emailVerificationURLWithToken: string,
            userContext: any
        ) => Promise<void>;
    };

    constructor(
        recipeInstance: Recipe,
        appInfo: NormalisedAppinfo,
        resetPasswordUsingTokenFeature?: {
            createAndSendCustomEmail?: (
                user: User,
                passwordResetURLWithToken: string,
                userContext: any
            ) => Promise<void>;
        },
        emailVerificationFeature?: {
            createAndSendCustomEmail?: (
                user: User,
                emailVerificationURLWithToken: string,
                userContext: any
            ) => Promise<void>;
        }
    ) {
        this.recipeInstance = recipeInstance;
        this.appInfo = appInfo;
        this.resetPasswordUsingTokenFeature = resetPasswordUsingTokenFeature;
        this.emailVerificationFeature = emailVerificationFeature;
    }

    sendEmail = async (input: TypeEmailPasswordEmailDeliveryInput & { userContext: any }) => {
        if (input.type === "EMAIL_VERIFICATION") {
            const inputCreateAndSendCustomEmail = this.emailVerificationFeature?.createAndSendCustomEmail;
            let createAndSendCustomEmail:
                | ((
                      user: EmailVerificationUser,
                      emailVerificationURLWithToken: string,
                      userContext: any
                  ) => Promise<void>)
                | undefined = undefined;
            if (inputCreateAndSendCustomEmail !== undefined) {
                createAndSendCustomEmail = async (user: EmailVerificationUser, link: string, userContext: any) => {
                    let userInfo = await this.recipeInstance.recipeInterfaceImpl.getUserById({
                        userId: user.id,
                        userContext,
                    });
                    if (userInfo === undefined) {
                        throw new Error("Unknown User ID provided");
                    }
                    return await inputCreateAndSendCustomEmail(userInfo, link, userContext);
                };
            }
            await new EmailVerificationBackwardCompatibilityService(
                this.appInfo,
                this.recipeInstance.isInServerlessEnv,
                createAndSendCustomEmail
            ).sendEmail(input);
        } else {
            let createAndSendCustomEmail = this.resetPasswordUsingTokenFeature?.createAndSendCustomEmail;
            if (createAndSendCustomEmail === undefined) {
                createAndSendCustomEmail = defaultCreateAndSendCustomEmail(this.appInfo);
            }
            try {
                if (!this.recipeInstance.isInServerlessEnv) {
                    createAndSendCustomEmail(input.user, input.passwordResetLink, input.userContext).catch((_) => {});
                } else {
                    // see https://github.com/supertokens/supertokens-node/pull/135
                    await createAndSendCustomEmail(input.user, input.passwordResetLink, input.userContext);
                }
            } catch (_) {}
        }
    };
}