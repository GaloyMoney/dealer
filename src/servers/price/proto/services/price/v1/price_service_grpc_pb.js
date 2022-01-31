// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('@grpc/grpc-js');
var services_price_v1_price_service_pb = require('../../../services/price/v1/price_service_pb.js');

function serialize_services_price_v1_GetImmediateUsdPriceForBuyRequest(arg) {
  if (!(arg instanceof services_price_v1_price_service_pb.GetImmediateUsdPriceForBuyRequest)) {
    throw new Error('Expected argument of type services.price.v1.GetImmediateUsdPriceForBuyRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_services_price_v1_GetImmediateUsdPriceForBuyRequest(buffer_arg) {
  return services_price_v1_price_service_pb.GetImmediateUsdPriceForBuyRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_services_price_v1_GetImmediateUsdPriceForBuyResponse(arg) {
  if (!(arg instanceof services_price_v1_price_service_pb.GetImmediateUsdPriceForBuyResponse)) {
    throw new Error('Expected argument of type services.price.v1.GetImmediateUsdPriceForBuyResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_services_price_v1_GetImmediateUsdPriceForBuyResponse(buffer_arg) {
  return services_price_v1_price_service_pb.GetImmediateUsdPriceForBuyResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_services_price_v1_GetImmediateUsdPriceForOptionBuyRequest(arg) {
  if (!(arg instanceof services_price_v1_price_service_pb.GetImmediateUsdPriceForOptionBuyRequest)) {
    throw new Error('Expected argument of type services.price.v1.GetImmediateUsdPriceForOptionBuyRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_services_price_v1_GetImmediateUsdPriceForOptionBuyRequest(buffer_arg) {
  return services_price_v1_price_service_pb.GetImmediateUsdPriceForOptionBuyRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_services_price_v1_GetImmediateUsdPriceForOptionBuyResponse(arg) {
  if (!(arg instanceof services_price_v1_price_service_pb.GetImmediateUsdPriceForOptionBuyResponse)) {
    throw new Error('Expected argument of type services.price.v1.GetImmediateUsdPriceForOptionBuyResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_services_price_v1_GetImmediateUsdPriceForOptionBuyResponse(buffer_arg) {
  return services_price_v1_price_service_pb.GetImmediateUsdPriceForOptionBuyResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_services_price_v1_GetImmediateUsdPriceForOptionSellRequest(arg) {
  if (!(arg instanceof services_price_v1_price_service_pb.GetImmediateUsdPriceForOptionSellRequest)) {
    throw new Error('Expected argument of type services.price.v1.GetImmediateUsdPriceForOptionSellRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_services_price_v1_GetImmediateUsdPriceForOptionSellRequest(buffer_arg) {
  return services_price_v1_price_service_pb.GetImmediateUsdPriceForOptionSellRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_services_price_v1_GetImmediateUsdPriceForOptionSellResponse(arg) {
  if (!(arg instanceof services_price_v1_price_service_pb.GetImmediateUsdPriceForOptionSellResponse)) {
    throw new Error('Expected argument of type services.price.v1.GetImmediateUsdPriceForOptionSellResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_services_price_v1_GetImmediateUsdPriceForOptionSellResponse(buffer_arg) {
  return services_price_v1_price_service_pb.GetImmediateUsdPriceForOptionSellResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_services_price_v1_GetImmediateUsdPriceForSellRequest(arg) {
  if (!(arg instanceof services_price_v1_price_service_pb.GetImmediateUsdPriceForSellRequest)) {
    throw new Error('Expected argument of type services.price.v1.GetImmediateUsdPriceForSellRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_services_price_v1_GetImmediateUsdPriceForSellRequest(buffer_arg) {
  return services_price_v1_price_service_pb.GetImmediateUsdPriceForSellRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_services_price_v1_GetImmediateUsdPriceForSellResponse(arg) {
  if (!(arg instanceof services_price_v1_price_service_pb.GetImmediateUsdPriceForSellResponse)) {
    throw new Error('Expected argument of type services.price.v1.GetImmediateUsdPriceForSellResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_services_price_v1_GetImmediateUsdPriceForSellResponse(buffer_arg) {
  return services_price_v1_price_service_pb.GetImmediateUsdPriceForSellResponse.deserializeBinary(new Uint8Array(buffer_arg));
}


var PriceServiceService = exports.PriceServiceService = {
  getImmediateUsdPriceForBuy: {
    path: '/services.price.v1.PriceService/GetImmediateUsdPriceForBuy',
    requestStream: false,
    responseStream: false,
    requestType: services_price_v1_price_service_pb.GetImmediateUsdPriceForBuyRequest,
    responseType: services_price_v1_price_service_pb.GetImmediateUsdPriceForBuyResponse,
    requestSerialize: serialize_services_price_v1_GetImmediateUsdPriceForBuyRequest,
    requestDeserialize: deserialize_services_price_v1_GetImmediateUsdPriceForBuyRequest,
    responseSerialize: serialize_services_price_v1_GetImmediateUsdPriceForBuyResponse,
    responseDeserialize: deserialize_services_price_v1_GetImmediateUsdPriceForBuyResponse,
  },
  getImmediateUsdPriceForSell: {
    path: '/services.price.v1.PriceService/GetImmediateUsdPriceForSell',
    requestStream: false,
    responseStream: false,
    requestType: services_price_v1_price_service_pb.GetImmediateUsdPriceForSellRequest,
    responseType: services_price_v1_price_service_pb.GetImmediateUsdPriceForSellResponse,
    requestSerialize: serialize_services_price_v1_GetImmediateUsdPriceForSellRequest,
    requestDeserialize: deserialize_services_price_v1_GetImmediateUsdPriceForSellRequest,
    responseSerialize: serialize_services_price_v1_GetImmediateUsdPriceForSellResponse,
    responseDeserialize: deserialize_services_price_v1_GetImmediateUsdPriceForSellResponse,
  },
  getImmediateUsdPriceForOptionBuy: {
    path: '/services.price.v1.PriceService/GetImmediateUsdPriceForOptionBuy',
    requestStream: false,
    responseStream: false,
    requestType: services_price_v1_price_service_pb.GetImmediateUsdPriceForOptionBuyRequest,
    responseType: services_price_v1_price_service_pb.GetImmediateUsdPriceForOptionBuyResponse,
    requestSerialize: serialize_services_price_v1_GetImmediateUsdPriceForOptionBuyRequest,
    requestDeserialize: deserialize_services_price_v1_GetImmediateUsdPriceForOptionBuyRequest,
    responseSerialize: serialize_services_price_v1_GetImmediateUsdPriceForOptionBuyResponse,
    responseDeserialize: deserialize_services_price_v1_GetImmediateUsdPriceForOptionBuyResponse,
  },
  getImmediateUsdPriceForOptionSell: {
    path: '/services.price.v1.PriceService/GetImmediateUsdPriceForOptionSell',
    requestStream: false,
    responseStream: false,
    requestType: services_price_v1_price_service_pb.GetImmediateUsdPriceForOptionSellRequest,
    responseType: services_price_v1_price_service_pb.GetImmediateUsdPriceForOptionSellResponse,
    requestSerialize: serialize_services_price_v1_GetImmediateUsdPriceForOptionSellRequest,
    requestDeserialize: deserialize_services_price_v1_GetImmediateUsdPriceForOptionSellRequest,
    responseSerialize: serialize_services_price_v1_GetImmediateUsdPriceForOptionSellResponse,
    responseDeserialize: deserialize_services_price_v1_GetImmediateUsdPriceForOptionSellResponse,
  },
};

exports.PriceServiceClient = grpc.makeGenericClientConstructor(PriceServiceService);
