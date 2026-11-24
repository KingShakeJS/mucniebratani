export function GET(): Response {
  return new Response('', {
    status: 200,
    headers: { 'Content-Type': 'image/x-icon' },
  });
}
