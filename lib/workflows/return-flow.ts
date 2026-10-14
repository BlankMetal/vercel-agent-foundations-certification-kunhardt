import {
  ApiRequestError,
  createReturn,
  getOrder,
  notifyReturnInProcess,
  preauthorizeRefund,
} from "@/lib/api";
import type { Order, Return } from "@/lib/types";

export async function returnFlow(orderId: string, reason: string) {
  "use workflow";

  const order = await getOrderStep(orderId);
  // A plain throw fails the run; workflow functions aren't retried.
  if (!order) throw new Error(`Order ${orderId} not found`);
  await notifyReturnInProcessStep(orderId);
  await preauthorizeRefundStep(orderId);
  const filed = await createReturnStep(order, reason);

  return { orderId, returnId: filed.id };
}

// Also called by the returnOrder tool before start(), so a wrong order ID is
// reported to the shopper instead of failing in the background. Outside a
// workflow "use step" is a no-op and this runs as a plain function.
//
// A missing order returns null instead of throwing, because a 404 won't change
// on retry, and an error's class doesn't reliably survive the step boundary
// for the caller to tell a 404 apart from a 5xx. Other errors throw and are
// retried.
export async function getOrderStep(orderId: string): Promise<Order | null> {
  "use step";
  try {
    return await getOrder(orderId);
  } catch (err) {
    if (err instanceof ApiRequestError && err.status === 404) return null;
    throw err;
  }
}

async function notifyReturnInProcessStep(orderId: string): Promise<void> {
  "use step";
  await notifyReturnInProcess(orderId);
}

async function preauthorizeRefundStep(orderId: string): Promise<void> {
  "use step";
  await preauthorizeRefund(orderId);
}

async function createReturnStep(order: Order, reason: string): Promise<Return> {
  "use step";
  return createReturn({
    orderId: order.id,
    items: order.items.map((i) => ({
      productId: i.productId,
      quantity: i.quantity,
    })),
    reason,
  });
}