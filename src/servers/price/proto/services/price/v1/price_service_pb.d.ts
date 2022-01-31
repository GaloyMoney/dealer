// package: services.price.v1
// file: services/price/v1/price_service.proto

/* tslint:disable */
/* eslint-disable */

import * as jspb from "google-protobuf";

export class GetImmediateUsdPriceForBuyRequest extends jspb.Message { 
    getAmountInSatoshis(): number;
    setAmountInSatoshis(value: number): GetImmediateUsdPriceForBuyRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): GetImmediateUsdPriceForBuyRequest.AsObject;
    static toObject(includeInstance: boolean, msg: GetImmediateUsdPriceForBuyRequest): GetImmediateUsdPriceForBuyRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: GetImmediateUsdPriceForBuyRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): GetImmediateUsdPriceForBuyRequest;
    static deserializeBinaryFromReader(message: GetImmediateUsdPriceForBuyRequest, reader: jspb.BinaryReader): GetImmediateUsdPriceForBuyRequest;
}

export namespace GetImmediateUsdPriceForBuyRequest {
    export type AsObject = {
        amountInSatoshis: number,
    }
}

export class GetImmediateUsdPriceForSellRequest extends jspb.Message { 
    getAmountInSatoshis(): number;
    setAmountInSatoshis(value: number): GetImmediateUsdPriceForSellRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): GetImmediateUsdPriceForSellRequest.AsObject;
    static toObject(includeInstance: boolean, msg: GetImmediateUsdPriceForSellRequest): GetImmediateUsdPriceForSellRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: GetImmediateUsdPriceForSellRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): GetImmediateUsdPriceForSellRequest;
    static deserializeBinaryFromReader(message: GetImmediateUsdPriceForSellRequest, reader: jspb.BinaryReader): GetImmediateUsdPriceForSellRequest;
}

export namespace GetImmediateUsdPriceForSellRequest {
    export type AsObject = {
        amountInSatoshis: number,
    }
}

export class GetImmediateUsdPriceForOptionBuyRequest extends jspb.Message { 
    getAmountInSatoshis(): number;
    setAmountInSatoshis(value: number): GetImmediateUsdPriceForOptionBuyRequest;
    getTimeInMinutes(): number;
    setTimeInMinutes(value: number): GetImmediateUsdPriceForOptionBuyRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): GetImmediateUsdPriceForOptionBuyRequest.AsObject;
    static toObject(includeInstance: boolean, msg: GetImmediateUsdPriceForOptionBuyRequest): GetImmediateUsdPriceForOptionBuyRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: GetImmediateUsdPriceForOptionBuyRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): GetImmediateUsdPriceForOptionBuyRequest;
    static deserializeBinaryFromReader(message: GetImmediateUsdPriceForOptionBuyRequest, reader: jspb.BinaryReader): GetImmediateUsdPriceForOptionBuyRequest;
}

export namespace GetImmediateUsdPriceForOptionBuyRequest {
    export type AsObject = {
        amountInSatoshis: number,
        timeInMinutes: number,
    }
}

export class GetImmediateUsdPriceForOptionSellRequest extends jspb.Message { 
    getAmountInSatoshis(): number;
    setAmountInSatoshis(value: number): GetImmediateUsdPriceForOptionSellRequest;
    getTimeInMinutes(): number;
    setTimeInMinutes(value: number): GetImmediateUsdPriceForOptionSellRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): GetImmediateUsdPriceForOptionSellRequest.AsObject;
    static toObject(includeInstance: boolean, msg: GetImmediateUsdPriceForOptionSellRequest): GetImmediateUsdPriceForOptionSellRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: GetImmediateUsdPriceForOptionSellRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): GetImmediateUsdPriceForOptionSellRequest;
    static deserializeBinaryFromReader(message: GetImmediateUsdPriceForOptionSellRequest, reader: jspb.BinaryReader): GetImmediateUsdPriceForOptionSellRequest;
}

export namespace GetImmediateUsdPriceForOptionSellRequest {
    export type AsObject = {
        amountInSatoshis: number,
        timeInMinutes: number,
    }
}

export class GetImmediateUsdPriceForBuyResponse extends jspb.Message { 
    getPriceInUsd(): number;
    setPriceInUsd(value: number): GetImmediateUsdPriceForBuyResponse;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): GetImmediateUsdPriceForBuyResponse.AsObject;
    static toObject(includeInstance: boolean, msg: GetImmediateUsdPriceForBuyResponse): GetImmediateUsdPriceForBuyResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: GetImmediateUsdPriceForBuyResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): GetImmediateUsdPriceForBuyResponse;
    static deserializeBinaryFromReader(message: GetImmediateUsdPriceForBuyResponse, reader: jspb.BinaryReader): GetImmediateUsdPriceForBuyResponse;
}

export namespace GetImmediateUsdPriceForBuyResponse {
    export type AsObject = {
        priceInUsd: number,
    }
}

export class GetImmediateUsdPriceForSellResponse extends jspb.Message { 
    getPriceInUsd(): number;
    setPriceInUsd(value: number): GetImmediateUsdPriceForSellResponse;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): GetImmediateUsdPriceForSellResponse.AsObject;
    static toObject(includeInstance: boolean, msg: GetImmediateUsdPriceForSellResponse): GetImmediateUsdPriceForSellResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: GetImmediateUsdPriceForSellResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): GetImmediateUsdPriceForSellResponse;
    static deserializeBinaryFromReader(message: GetImmediateUsdPriceForSellResponse, reader: jspb.BinaryReader): GetImmediateUsdPriceForSellResponse;
}

export namespace GetImmediateUsdPriceForSellResponse {
    export type AsObject = {
        priceInUsd: number,
    }
}

export class GetImmediateUsdPriceForOptionBuyResponse extends jspb.Message { 
    getPriceInUsd(): number;
    setPriceInUsd(value: number): GetImmediateUsdPriceForOptionBuyResponse;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): GetImmediateUsdPriceForOptionBuyResponse.AsObject;
    static toObject(includeInstance: boolean, msg: GetImmediateUsdPriceForOptionBuyResponse): GetImmediateUsdPriceForOptionBuyResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: GetImmediateUsdPriceForOptionBuyResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): GetImmediateUsdPriceForOptionBuyResponse;
    static deserializeBinaryFromReader(message: GetImmediateUsdPriceForOptionBuyResponse, reader: jspb.BinaryReader): GetImmediateUsdPriceForOptionBuyResponse;
}

export namespace GetImmediateUsdPriceForOptionBuyResponse {
    export type AsObject = {
        priceInUsd: number,
    }
}

export class GetImmediateUsdPriceForOptionSellResponse extends jspb.Message { 
    getPriceInUsd(): number;
    setPriceInUsd(value: number): GetImmediateUsdPriceForOptionSellResponse;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): GetImmediateUsdPriceForOptionSellResponse.AsObject;
    static toObject(includeInstance: boolean, msg: GetImmediateUsdPriceForOptionSellResponse): GetImmediateUsdPriceForOptionSellResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: GetImmediateUsdPriceForOptionSellResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): GetImmediateUsdPriceForOptionSellResponse;
    static deserializeBinaryFromReader(message: GetImmediateUsdPriceForOptionSellResponse, reader: jspb.BinaryReader): GetImmediateUsdPriceForOptionSellResponse;
}

export namespace GetImmediateUsdPriceForOptionSellResponse {
    export type AsObject = {
        priceInUsd: number,
    }
}
