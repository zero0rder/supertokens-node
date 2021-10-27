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

import { BaseRequest, BaseResponse } from "../../framework";
import RecipeModule from "../../recipeModule";

export type UserInfo = { id: string; email?: { id: string; isVerified: boolean } };

export interface ThirdPartyRecipeModule extends RecipeModule {
    getClientIds?: () => Promise<string[]>;
}
export type TypeInput = {
    hosts: string | undefined;
    apiKey?: string;
    recipeModules: ThirdPartyRecipeModule[];
};

export const InputSchema = {
    type: "object",
    properties: {},
    additionalProperties: false,
};

export interface RecipeInterface {}

export type APIOptions = {
    recipeImplementation: RecipeInterface;
    config: TypeInput;
    recipeId: string;
    isInServerlessEnv: boolean;
    req: BaseRequest;
    res: BaseResponse;
};

export type HealthCheckResponse = {
    status: string;
    message?: string;
};
export interface APIInterface {
    healthCheckGET: (input: TypeInput) => Promise<HealthCheckResponse>;
}