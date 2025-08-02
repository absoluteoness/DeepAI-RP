export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;
    const headers = {
      'Api-Key': "fe5dd5b0-f37b-4449-9dc9-cd5e771888fc",
    };

    // 🎨 IMAGE GENERATION (GET + POST)
    if (path === "/image") {
      let prompt = "";

      if (method === "POST") {
        const body = await request.formData();
        prompt = body.get("text") || "";
      } else if (method === "GET") {
        prompt = url.searchParams.get("text") || "";
      }

      if (!prompt) {
        return new Response(JSON.stringify({ error: "Missing 'text' parameter" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      const resp = await fetch("https://api.deepai.org/api/text2img", {
        method: "POST",
        headers,
        body: new URLSearchParams({ text: prompt }),
      });
      return new Response(await resp.text(), { status: resp.status });
    }

    // 👁️ OCR (Only POST - GET not supported natively)
    if (path === "/ocr") {
      if (method === "GET") {
        return new Response(JSON.stringify({
          error: "OCR requires POST with image",
          usage: "curl -X POST -F 'image=@your.png' https://yourproxy/ocr"
        }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      const body = await request.formData();
      const image = body.get("image");

      const form = new FormData();
      form.append("image", image);

      const resp = await fetch("https://api.deepai.org/api/ocr", {
        method: "POST",
        headers,
        body: form,
      });
      return new Response(await resp.text(), { status: resp.status });
    }

    // 🏠 ROOT
    return new Response(JSON.stringify({
      message: "Welcome to DeepAI Proxy",
      endpoints: {
        "/image": "Generate image from text (GET or POST)",
        "/ocr": "Extract text from image (POST only)"
      }
    }), { headers: { "Content-Type": "application/json" } });
  },
};
