import { Request, Response } from "express";
import { verifyWebhook } from "@clerk/express/webhooks";
import { prisma } from "../configs/prisma.js";
import * as Sentry from "@sentry/node";
const clerkWebhooks = async (req: Request, res: Response) => {
  try {
    const evt = await verifyWebhook(req);

    console.log("Webhook verified!");
    console.log(evt);

    const { data, type } = evt;

    switch (type) {
      case "user.created": {
        await prisma.user.create({
          data: {
            id: data.id,
            email: data?.email_addresses[0]?.email_address,
            name: `${data?.first_name ?? ""} ${data?.last_name ?? ""}`,
            image: data?.image_url,
          },
        });
        break;
      }

      case "user.updated": {
        await prisma.user.upsert({
          where: {
            id: data.id,
          },
          update: {
            email: data?.email_addresses[0]?.email_address,
            name: `${data?.first_name ?? ""} ${data?.last_name ?? ""}`,
            image: data?.image_url,
          },
          create: {
            id: data.id,
            email: data?.email_addresses[0]?.email_address,
            name: `${data?.first_name ?? ""} ${data?.last_name ?? ""}`,
            image: data?.image_url,
          },
        });

        break;
      }

      case "user.deleted": {
        await prisma.user.delete({
          where: {
            id: data.id,
          },
        });
        break;
      }

      case "paymentAttempt.updated": {
        if (
          (data.charge_type === "recurring" ||
            data.charge_type === "checkout") &&
          data.status === "paid"
        ) {
          const credits = {
            pro: 80,
            premium: 240,
          };

          const clerkUserId = data.payer?.user_id;
          const slug = data?.subscription_items?.[0]?.plan?.slug;

          if (!slug || (slug !== "pro" && slug !== "premium")) {
            return res.status(400).json({ message: "Invalid plan" });
          }

          const planId = slug as keyof typeof credits;

          await prisma.user.update({
            where: { id: clerkUserId },
            data: {
              credits: {
                increment: credits[planId],
              },
            },
          });
        }
        break;
      }

      default:
        break;
    }

    return res.json({
      message: "Webhook Received: " + type,
    });
  } catch (error: any) {
    Sentry.captureException(error);
    console.error(error);

    if (error.meta) {
      console.log("Meta:", error.meta);
    }

    return res.status(500).json({
      message: error?.message || "Unknown error",
    });
  }
};
export default clerkWebhooks;
