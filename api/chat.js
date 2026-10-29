export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body;
  const apiKey = process.env.HUGGINGFACE_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'HUGGINGFACE_API_KEY is not configured' });
  }

  try {
    const response = await fetch("https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-8B-Instruct", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        inputs: `<|start_header_id|>system<|end_header_id|>
أنت مساعد ذكي ومحترف في منصة WorldX AI. تتحدث حصرياً وتجيب بالدارجة المغربية بطلاقة وبأسلوب ودود وقريب للمستخدم.<|eot_id|>
<|start_header_id|>user<|end_header_id|>
${prompt}<|eot_id|>
<|start_header_id|>assistant<|end_header_id|>`,
        parameters: {
          max_new_tokens: 500,
          temperature: 0.7,
          return_full_text: false
        }
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'خطأ في الاتصال بالخدمة');
    }

    let reply = "";
    if (Array.isArray(data) && data[0]?.generated_text) {
      reply = data[0].generated_text;
    } else if (data.generated_text) {
      reply = data.generated_text;
    } else {
      reply = JSON.stringify(data);
    }

    return res.status(200).json({ reply: reply.trim() });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
