import { createResponse } from "../../_utils/tools.ts";
import { singUpWithEmail } from "../utils.ts";

export async function singup_email(
  { req, t0, endpoint }: { req: Request; t0: number; endpoint: string },
) {
  const { email, password } = await req.json();
  const { error } = await singUpWithEmail(email, password);

  if (error) {
    console.error(error);
    return createResponse({
      responseData: "Forbidden",
      status: 403,
      t0,
      endpoint,
    });
  }
  return createResponse({
    responseData: "Please check your email for signup confirmation",
    t0,
    endpoint,
  });
}
