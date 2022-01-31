// package: services.price.v1
// file: services/price/v1/price_service.proto

/* tslint:disable */
/* eslint-disable */

import * as grpc from "@grpc/grpc-js";
import * as services_price_v1_price_service_pb from "../../../services/price/v1/price_service_pb";

interface IPriceServiceService extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
    getImmediateUsdPriceForBuy: IPriceServiceService_IGetImmediateUsdPriceForBuy;
    getImmediateUsdPriceForSell: IPriceServiceService_IGetImmediateUsdPriceForSell;
    getImmediateUsdPriceForOptionBuy: IPriceServiceService_IGetImmediateUsdPriceForOptionBuy;
    getImmediateUsdPriceForOptionSell: IPriceServiceService_IGetImmediateUsdPriceForOptionSell;
}

interface IPriceServiceService_IGetImmediateUsdPriceForBuy extends grpc.MethodDefinition<services_price_v1_price_service_pb.GetImmediateUsdPriceForBuyRequest, services_price_v1_price_service_pb.GetImmediateUsdPriceForBuyResponse> {
    path: "/services.price.v1.PriceService/GetImmediateUsdPriceForBuy";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<services_price_v1_price_service_pb.GetImmediateUsdPriceForBuyRequest>;
    requestDeserialize: grpc.deserialize<services_price_v1_price_service_pb.GetImmediateUsdPriceForBuyRequest>;
    responseSerialize: grpc.serialize<services_price_v1_price_service_pb.GetImmediateUsdPriceForBuyResponse>;
    responseDeserialize: grpc.deserialize<services_price_v1_price_service_pb.GetImmediateUsdPriceForBuyResponse>;
}
interface IPriceServiceService_IGetImmediateUsdPriceForSell extends grpc.MethodDefinition<services_price_v1_price_service_pb.GetImmediateUsdPriceForSellRequest, services_price_v1_price_service_pb.GetImmediateUsdPriceForSellResponse> {
    path: "/services.price.v1.PriceService/GetImmediateUsdPriceForSell";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<services_price_v1_price_service_pb.GetImmediateUsdPriceForSellRequest>;
    requestDeserialize: grpc.deserialize<services_price_v1_price_service_pb.GetImmediateUsdPriceForSellRequest>;
    responseSerialize: grpc.serialize<services_price_v1_price_service_pb.GetImmediateUsdPriceForSellResponse>;
    responseDeserialize: grpc.deserialize<services_price_v1_price_service_pb.GetImmediateUsdPriceForSellResponse>;
}
interface IPriceServiceService_IGetImmediateUsdPriceForOptionBuy extends grpc.MethodDefinition<services_price_v1_price_service_pb.GetImmediateUsdPriceForOptionBuyRequest, services_price_v1_price_service_pb.GetImmediateUsdPriceForOptionBuyResponse> {
    path: "/services.price.v1.PriceService/GetImmediateUsdPriceForOptionBuy";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<services_price_v1_price_service_pb.GetImmediateUsdPriceForOptionBuyRequest>;
    requestDeserialize: grpc.deserialize<services_price_v1_price_service_pb.GetImmediateUsdPriceForOptionBuyRequest>;
    responseSerialize: grpc.serialize<services_price_v1_price_service_pb.GetImmediateUsdPriceForOptionBuyResponse>;
    responseDeserialize: grpc.deserialize<services_price_v1_price_service_pb.GetImmediateUsdPriceForOptionBuyResponse>;
}
interface IPriceServiceService_IGetImmediateUsdPriceForOptionSell extends grpc.MethodDefinition<services_price_v1_price_service_pb.GetImmediateUsdPriceForOptionSellRequest, services_price_v1_price_service_pb.GetImmediateUsdPriceForOptionSellResponse> {
    path: "/services.price.v1.PriceService/GetImmediateUsdPriceForOptionSell";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<services_price_v1_price_service_pb.GetImmediateUsdPriceForOptionSellRequest>;
    requestDeserialize: grpc.deserialize<services_price_v1_price_service_pb.GetImmediateUsdPriceForOptionSellRequest>;
    responseSerialize: grpc.serialize<services_price_v1_price_service_pb.GetImmediateUsdPriceForOptionSellResponse>;
    responseDeserialize: grpc.deserialize<services_price_v1_price_service_pb.GetImmediateUsdPriceForOptionSellResponse>;
}

export const PriceServiceService: IPriceServiceService;

export interface IPriceServiceServer extends grpc.UntypedServiceImplementation {
    getImmediateUsdPriceForBuy: grpc.handleUnaryCall<services_price_v1_price_service_pb.GetImmediateUsdPriceForBuyRequest, services_price_v1_price_service_pb.GetImmediateUsdPriceForBuyResponse>;
    getImmediateUsdPriceForSell: grpc.handleUnaryCall<services_price_v1_price_service_pb.GetImmediateUsdPriceForSellRequest, services_price_v1_price_service_pb.GetImmediateUsdPriceForSellResponse>;
    getImmediateUsdPriceForOptionBuy: grpc.handleUnaryCall<services_price_v1_price_service_pb.GetImmediateUsdPriceForOptionBuyRequest, services_price_v1_price_service_pb.GetImmediateUsdPriceForOptionBuyResponse>;
    getImmediateUsdPriceForOptionSell: grpc.handleUnaryCall<services_price_v1_price_service_pb.GetImmediateUsdPriceForOptionSellRequest, services_price_v1_price_service_pb.GetImmediateUsdPriceForOptionSellResponse>;
}

export interface IPriceServiceClient {
    getImmediateUsdPriceForBuy(request: services_price_v1_price_service_pb.GetImmediateUsdPriceForBuyRequest, callback: (error: grpc.ServiceError | null, response: services_price_v1_price_service_pb.GetImmediateUsdPriceForBuyResponse) => void): grpc.ClientUnaryCall;
    getImmediateUsdPriceForBuy(request: services_price_v1_price_service_pb.GetImmediateUsdPriceForBuyRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: services_price_v1_price_service_pb.GetImmediateUsdPriceForBuyResponse) => void): grpc.ClientUnaryCall;
    getImmediateUsdPriceForBuy(request: services_price_v1_price_service_pb.GetImmediateUsdPriceForBuyRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: services_price_v1_price_service_pb.GetImmediateUsdPriceForBuyResponse) => void): grpc.ClientUnaryCall;
    getImmediateUsdPriceForSell(request: services_price_v1_price_service_pb.GetImmediateUsdPriceForSellRequest, callback: (error: grpc.ServiceError | null, response: services_price_v1_price_service_pb.GetImmediateUsdPriceForSellResponse) => void): grpc.ClientUnaryCall;
    getImmediateUsdPriceForSell(request: services_price_v1_price_service_pb.GetImmediateUsdPriceForSellRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: services_price_v1_price_service_pb.GetImmediateUsdPriceForSellResponse) => void): grpc.ClientUnaryCall;
    getImmediateUsdPriceForSell(request: services_price_v1_price_service_pb.GetImmediateUsdPriceForSellRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: services_price_v1_price_service_pb.GetImmediateUsdPriceForSellResponse) => void): grpc.ClientUnaryCall;
    getImmediateUsdPriceForOptionBuy(request: services_price_v1_price_service_pb.GetImmediateUsdPriceForOptionBuyRequest, callback: (error: grpc.ServiceError | null, response: services_price_v1_price_service_pb.GetImmediateUsdPriceForOptionBuyResponse) => void): grpc.ClientUnaryCall;
    getImmediateUsdPriceForOptionBuy(request: services_price_v1_price_service_pb.GetImmediateUsdPriceForOptionBuyRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: services_price_v1_price_service_pb.GetImmediateUsdPriceForOptionBuyResponse) => void): grpc.ClientUnaryCall;
    getImmediateUsdPriceForOptionBuy(request: services_price_v1_price_service_pb.GetImmediateUsdPriceForOptionBuyRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: services_price_v1_price_service_pb.GetImmediateUsdPriceForOptionBuyResponse) => void): grpc.ClientUnaryCall;
    getImmediateUsdPriceForOptionSell(request: services_price_v1_price_service_pb.GetImmediateUsdPriceForOptionSellRequest, callback: (error: grpc.ServiceError | null, response: services_price_v1_price_service_pb.GetImmediateUsdPriceForOptionSellResponse) => void): grpc.ClientUnaryCall;
    getImmediateUsdPriceForOptionSell(request: services_price_v1_price_service_pb.GetImmediateUsdPriceForOptionSellRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: services_price_v1_price_service_pb.GetImmediateUsdPriceForOptionSellResponse) => void): grpc.ClientUnaryCall;
    getImmediateUsdPriceForOptionSell(request: services_price_v1_price_service_pb.GetImmediateUsdPriceForOptionSellRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: services_price_v1_price_service_pb.GetImmediateUsdPriceForOptionSellResponse) => void): grpc.ClientUnaryCall;
}

export class PriceServiceClient extends grpc.Client implements IPriceServiceClient {
    constructor(address: string, credentials: grpc.ChannelCredentials, options?: Partial<grpc.ClientOptions>);
    public getImmediateUsdPriceForBuy(request: services_price_v1_price_service_pb.GetImmediateUsdPriceForBuyRequest, callback: (error: grpc.ServiceError | null, response: services_price_v1_price_service_pb.GetImmediateUsdPriceForBuyResponse) => void): grpc.ClientUnaryCall;
    public getImmediateUsdPriceForBuy(request: services_price_v1_price_service_pb.GetImmediateUsdPriceForBuyRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: services_price_v1_price_service_pb.GetImmediateUsdPriceForBuyResponse) => void): grpc.ClientUnaryCall;
    public getImmediateUsdPriceForBuy(request: services_price_v1_price_service_pb.GetImmediateUsdPriceForBuyRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: services_price_v1_price_service_pb.GetImmediateUsdPriceForBuyResponse) => void): grpc.ClientUnaryCall;
    public getImmediateUsdPriceForSell(request: services_price_v1_price_service_pb.GetImmediateUsdPriceForSellRequest, callback: (error: grpc.ServiceError | null, response: services_price_v1_price_service_pb.GetImmediateUsdPriceForSellResponse) => void): grpc.ClientUnaryCall;
    public getImmediateUsdPriceForSell(request: services_price_v1_price_service_pb.GetImmediateUsdPriceForSellRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: services_price_v1_price_service_pb.GetImmediateUsdPriceForSellResponse) => void): grpc.ClientUnaryCall;
    public getImmediateUsdPriceForSell(request: services_price_v1_price_service_pb.GetImmediateUsdPriceForSellRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: services_price_v1_price_service_pb.GetImmediateUsdPriceForSellResponse) => void): grpc.ClientUnaryCall;
    public getImmediateUsdPriceForOptionBuy(request: services_price_v1_price_service_pb.GetImmediateUsdPriceForOptionBuyRequest, callback: (error: grpc.ServiceError | null, response: services_price_v1_price_service_pb.GetImmediateUsdPriceForOptionBuyResponse) => void): grpc.ClientUnaryCall;
    public getImmediateUsdPriceForOptionBuy(request: services_price_v1_price_service_pb.GetImmediateUsdPriceForOptionBuyRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: services_price_v1_price_service_pb.GetImmediateUsdPriceForOptionBuyResponse) => void): grpc.ClientUnaryCall;
    public getImmediateUsdPriceForOptionBuy(request: services_price_v1_price_service_pb.GetImmediateUsdPriceForOptionBuyRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: services_price_v1_price_service_pb.GetImmediateUsdPriceForOptionBuyResponse) => void): grpc.ClientUnaryCall;
    public getImmediateUsdPriceForOptionSell(request: services_price_v1_price_service_pb.GetImmediateUsdPriceForOptionSellRequest, callback: (error: grpc.ServiceError | null, response: services_price_v1_price_service_pb.GetImmediateUsdPriceForOptionSellResponse) => void): grpc.ClientUnaryCall;
    public getImmediateUsdPriceForOptionSell(request: services_price_v1_price_service_pb.GetImmediateUsdPriceForOptionSellRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: services_price_v1_price_service_pb.GetImmediateUsdPriceForOptionSellResponse) => void): grpc.ClientUnaryCall;
    public getImmediateUsdPriceForOptionSell(request: services_price_v1_price_service_pb.GetImmediateUsdPriceForOptionSellRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: services_price_v1_price_service_pb.GetImmediateUsdPriceForOptionSellResponse) => void): grpc.ClientUnaryCall;
}
