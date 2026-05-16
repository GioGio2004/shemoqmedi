import { EmailTemplate } from "@/app/[locale]/(temlates)/(menus)/light-menu/components/email-template";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { cart, totalPrice } = await req.json();

    const { data, error } = await resend.emails.send({
      from: "Karabak Orders <onboarding@resend.dev>",
      to: ["khvichia42@gmail.com"],
      subject: "New Order Received - Karabak",
      react: EmailTemplate({ orderItems: cart, totalPrice }),
    });

    if (error) {
      return Response.json({ error }, { status: 500 });
    }

    return Response.json(data);
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}
