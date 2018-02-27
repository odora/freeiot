/*
 * Copyright (c) 2017. Noah Gao <noahgaocn@gmail.com>
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

package net.noahgao.freeiot.api;

import android.util.ArrayMap;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;

import net.noahgao.freeiot.model.DeviceModel;
import net.noahgao.freeiot.model.ModModel;
import net.noahgao.freeiot.model.NotificationMetaModel;
import net.noahgao.freeiot.model.ProductModel;
import net.noahgao.freeiot.model.ProductSimpleModel;
import net.noahgao.freeiot.model.UserModel;

import java.util.List;

import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.Field;
import retrofit2.http.FormUrlEncoded;
import retrofit2.http.GET;
import retrofit2.http.POST;
import retrofit2.http.PUT;
import retrofit2.http.DELETE;
import retrofit2.http.Path;
import retrofit2.http.Query;

public interface Api {

    @FormUrlEncoded
    @POST("/user/auth")
    Call<UserModel> auth(@Field("email") String email, @Field("password") String password);

    @FormUrlEncoded
    @POST("/user")
    Call<UserModel> reg(@Field("email") String email, @Field("password") String password);

    @FormUrlEncoded
    @PUT("/user/{id}")
    Call<Object> modifyPassword(@Path("id") String id, @Field("password") String password,@Query("token") String token);

    @PUT("/user/{id}")
    Call<Object> modifyPushSetting(@Path("id") String id, @Body UserModel setting, @Query("token") String token);

    @GET("/user/{id}")
    Call<UserModel> getUser(@Path("id") String id, @Query("token") String token);

    @GET("/product")
    Call<List<ProductSimpleModel>> getProducts(@Query("token") String token);

    @GET("/product/{id}")
    Call<ProductModel<UserModel>> getProduct(@Path("id") String id, @Query("token") String token);

    @GET("/device")
    Call<List<DeviceModel.DeviceMeta.DeviceMetaModel<ProductSimpleModel<String>>>> getDevices(@Query("owner") String owner, @Query("token") String token);

    @GET("/device/{id}")
    Call<DeviceModel> getDevice(@Path("id") String id, @Query("token") String token);

    @GET("/device/{id}/{datalimit}")
    Call<DeviceModel> getDevice(@Path("id") String id,@Path("datalimit") int datalimit, @Query("token") String token);

    @FormUrlEncoded
    @POST("/device")
    Call<JSONObject> putDevice(@Field("name") String name, @Field("owner") String owner, @Field("product") String product, @Query("token") String token);

    @POST("/device/{id}/data")
    Call<JSONArray> putData(@Path("id") String id, @Body ArrayMap data, @Query("token") String token);

    @PUT("/device/{id}/empty")
    Call<Object> emptyData(@Path("id") String id, @Query("token") String token);

    @GET("/device/{id}/activite/{owner}")
    Call<Object> activiteDevice(@Path("id") String id, @Path("owner") String newuser, @Query("token") String token);

    @PUT("/device/{id}/makeoffline")
    Call<Object> disconnectDevice(@Path("id") String id, @Query("token") String token);

    @DELETE("/device/{id}")
    Call<Object> deleteDevice(@Path("id") String id, @Query("token") String token);

    @FormUrlEncoded
    @PUT("/device/{id}")
    Call<Object> renameDevice(@Path("id") String id, @Field("name") String newname, @Query("token") String token);

    @POST("/mod/{id}")
    Call<ModModel> getMod(@Path("id") String id, @Body JSONObject vars, @Query("token") String token);

    @GET("/notification")
    Call<NotificationMetaModel> getNotificationMeta(@Query("token") String token);

}