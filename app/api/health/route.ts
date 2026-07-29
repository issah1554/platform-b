import { optionsResponse, withCors } from "../_utils";

export function GET() {
  return withCors({
    source_name: "Platform B",
    status: "ok",
    checked_at: new Date().toISOString()
  });
}

export function OPTIONS() {
  return optionsResponse();
}
