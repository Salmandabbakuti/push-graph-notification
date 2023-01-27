import { BigInt } from "@graphprotocol/graph-ts";
import { Transfer as TransferEvent } from "../generated/PushToken/PushToken";
import { Transfer } from "../generated/schema";
import { sendEPNSNotification } from "./EPNSNotification";
export const subgraphID = "salmandabbakuti/push-graph-test";

let ZERO_BI = BigInt.fromI32(0);
let ONE_BI = BigInt.fromI32(1);

function exponentToBigInt(decimals: BigInt): BigInt {
  let bd = BigInt.fromString('1');
  for (let i = ZERO_BI; i.lt(decimals as BigInt); i = i.plus(ONE_BI)) {
    bd = bd.times(BigInt.fromString('10'));
  }
  return bd;
}

export function handleTransfer(event: TransferEvent): void {
  let transfer = new Transfer(event.transaction.hash.toHex() + "-" + event.logIndex.toString());
  transfer.from = event.params.from.toHex();
  transfer.to = event.params.to.toHex();
  transfer.amount = event.params.amount;
  transfer.txHash = event.transaction.hash.toHex();
  transfer.timestamp = event.block.timestamp;
  transfer.save();

  let power = exponentToBigInt(BigInt.fromI32(18));

  let recipient = event.params.to.toHex(),
    type = "3",
    title = "PUSH Tokens Received",
    body = `Received ${event.params.amount.div(power)} PUSH from ${event.params.from.toHexString()}`,
    subject = "PUSH Tokens Received",
    message = `Received ${event.params.amount.div(power)} PUSH from ${event.params.from.toHexString()}`,
    image = "https://play-lh.googleusercontent.com/i911_wMmFilaAAOTLvlQJZMXoxBF34BMSzRmascHezvurtslYUgOHamxgEnMXTklsF-S",
    secret = "null",
    cta = `https://goerli.etherscan.io/tx/${event.transaction.hash.toHex()}`,

    notification = `{\"type\": \"${type}\", \"title\": \"${title}\", \"body\": \"${body}\", \"subject\": \"${subject}\", \"message\": \"${message}\", \"image\": \"${image}\", \"secret\": \"${secret}\", \"cta\": \"${cta}\"}`;

  sendEPNSNotification(
    recipient,
    notification
  );
}