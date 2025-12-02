import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AIRequest {
  model: 'gemini' | 'deepseek' | 'glm';
  action: 'analyze-application' | 'generate-email' | 'generate-broadcast' | 'chat';
  prompt: string;
  context?: any;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { model, action, prompt, context }: AIRequest = await req.json();
    console.log(`AI Request - Model: ${model}, Action: ${action}`);

    let response;
    switch (model) {
      case 'gemini':
        response = await callGemini(action, prompt, context);
        break;
      case 'deepseek':
        response = await callDeepSeek(action, prompt, context);
        break;
      case 'glm':
        response = await callGLM(action, prompt, context);
        break;
      default:
        throw new Error('Invalid model specified');
    }

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('AI Assistant Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function callGemini(action: string, prompt: string, context: any) {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured');

  const systemPrompt = getSystemPrompt(action);
  const userPrompt = formatPrompt(action, prompt, context);

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${LOVABLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Gemini API Error:', response.status, errorText);
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  return {
    model: 'gemini-2.5-flash',
    content: data.choices[0].message.content,
    usage: data.usage
  };
}

async function callDeepSeek(action: string, prompt: string, context: any) {
  const DEEPSEEK_API_KEY = Deno.env.get('DEEPSEEK_API_KEY');
  if (!DEEPSEEK_API_KEY) throw new Error('DEEPSEEK_API_KEY not configured');

  const systemPrompt = getSystemPrompt(action);
  const userPrompt = formatPrompt(action, prompt, context);

  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('DeepSeek API Error:', response.status, errorText);
    throw new Error(`DeepSeek API error: ${response.status}`);
  }

  const data = await response.json();
  return {
    model: 'deepseek-chat',
    content: data.choices[0].message.content,
    usage: data.usage
  };
}

async function callGLM(action: string, prompt: string, context: any) {
  const GLM_API_KEY = Deno.env.get('GLM_API_KEY');
  if (!GLM_API_KEY) throw new Error('GLM_API_KEY not configured');

  const systemPrompt = getSystemPrompt(action);
  const userPrompt = formatPrompt(action, prompt, context);

  const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GLM_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'glm-4-plus',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('GLM API Error:', response.status, errorText);
    throw new Error(`GLM API error: ${response.status}`);
  }

  const data = await response.json();
  return {
    model: 'glm-4-plus',
    content: data.choices[0].message.content,
    usage: data.usage
  };
}

function getSystemPrompt(action: string): string {
  switch (action) {
    case 'analyze-application':
      return `คุณเป็น AI ผู้เชี่ยวชาญในการวิเคราะห์ใบสมัครงาน วิเคราะห์ข้อมูลผู้สมัครอย่างละเอียดและให้คำแนะนำที่เป็นประโยชน์
      
ให้วิเคราะห์ในหัวข้อต่อไปนี้:
1. **จุดแข็ง** - ทักษะและความสามารถที่โดดเด่น
2. **ความเหมาะสม** - ความเข้ากันกับตำแหน่งที่สมัคร (0-100%)
3. **จุดที่ควรพัฒนา** - ข้อเสนอแนะในการพัฒนา
4. **คำแนะนำ** - ข้อเสนอแนะสำหรับ Admin

ตอบเป็นภาษาไทยในรูปแบบ Markdown ที่อ่านง่าย`;

    case 'generate-email':
      return `คุณเป็น AI ผู้เชี่ยวชาญในการเขียนอีเมล สร้างเนื้อหาอีเมลที่เป็นมืออาชีพและเหมาะสมกับบริบท
      
กรุณาสร้างอีเมลที่:
- มีน้ำเสียงที่เหมาะสมและเป็นมืออาชีพ
- ชัดเจนและตรงประเด็น
- รองรับตัวแปร (variables) สำหรับ personalization
- มี HTML formatting ที่สวยงาม

ตอบเป็น JSON format:
{
  "subject": "หัวข้ออีเมล",
  "html_content": "เนื้อหาอีเมลแบบ HTML",
  "variables": ["variable1", "variable2"]
}`;

    case 'generate-broadcast':
      return `คุณเป็น AI ผู้เชี่ยวชาญในการเขียนข้อความ LINE Broadcast ที่น่าสนใจและมีประสิทธิภาพ

สร้างข้อความที่:
- กระชับและตรงประเด็น
- ใช้ emoji ที่เหมาะสม
- มี call-to-action ที่ชัดเจน
- น่าสนใจและดึงดูดความสนใจ

ตอบเป็นภาษาไทย`;

    case 'chat':
      return `คุณเป็น AI Assistant สำหรับ Admin ของชมรม SPU AI CLUB
      
คุณสามารถช่วย:
- ตอบคำถามเกี่ยวกับระบบและข้อมูล
- ให้คำแนะนำในการจัดการใบสมัคร
- แนะนำแนวทางในการติดต่อกับผู้สมัคร
- สรุปข้อมูลและสถิติต่างๆ

ตอบเป็นภาษาไทยอย่างเป็นมิตรและเป็นมืออาชีพ`;

    default:
      return 'คุณเป็น AI Assistant ที่ช่วยเหลือ Admin ในการทำงาน ตอบเป็นภาษาไทย';
  }
}

function formatPrompt(action: string, prompt: string, context: any): string {
  switch (action) {
    case 'analyze-application':
      return `วิเคราะห์ใบสมัครต่อไปนี้:

**ข้อมูลผู้สมัคร:**
${JSON.stringify(context, null, 2)}

**คำถามเพิ่มเติม:** ${prompt}

กรุณาวิเคราะห์อย่างละเอียดและให้คำแนะนำที่เป็นประโยชน์`;

    case 'generate-email':
      return `สร้างอีเมล template สำหรับ: ${prompt}

${context ? `**บริบทเพิ่มเติม:**\n${JSON.stringify(context, null, 2)}` : ''}

กรุณาสร้างอีเมลที่เหมาะสมและเป็นมืออาชีพ`;

    case 'generate-broadcast':
      return `สร้างข้อความ LINE Broadcast สำหรับ: ${prompt}

${context ? `**บริบทเพิ่มเติม:**\n${JSON.stringify(context, null, 2)}` : ''}

กรุณาสร้างข้อความที่น่าสนใจและมีประสิทธิภาพ`;

    default:
      return prompt;
  }
}