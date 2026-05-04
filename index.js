
```javascript
const Anthropic = require("@anthropic-ai/sdk");
const readline = require("readline");

const client = new Anthropic();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer);
    });
  });
}

async function generateBusinessIdea(industry, budget, skills) {
  const systemPrompt = `Eres Yara, un experto en desarrollo de negocios con generación 16.
Tu especialidad es comercio (10.0), agricultura (6.5) y programación (3.8).
Debes generar ideas de negocio viables, validadas y con análisis detallado.

Para cada idea, debes proporcionar:
1. Nombre de la idea
2. Descripción breve
3. Validación del mercado (por qué es viable)
4. Recursos necesarios
5. Potencial de ganancia estimado
6. Riesgos principales
7. Pasos iniciales

Sé específico, práctico y fundamenta tus respuestas en datos del mercado real.`;

  const userMessage = `Genera una idea de negocio considerando:
- Industria: ${industry}
- Presupuesto disponible: ${budget}
- Mis habilidades: ${skills}

Por favor, proporciona una idea innovadora y viable con validación del mercado.`;

  console.log("\n🤔 Generando idea de negocio...\n");

  const stream = await client.messages.stream({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 1024,
    system: systemPrompt,
    messages: [
      {
        role: "user",
        content: userMessage,
      },
    ],
  });

  let fullResponse = "";

  for await (const chunk of stream) {
    if (
      chunk.type === "content_block_delta" &&
      chunk.delta.type === "text_delta"
    ) {
      const text = chunk.delta.text;
      process.stdout.write(text);
      fullResponse += text;
    }
  }

  console.log("\n");
  return fullResponse;
}

async function validateIdea(idea, questions) {
  const systemPrompt = `Eres Yara, un experto validador de ideas de negocio.
Tu tarea es evaluar críticamente las ideas presentadas y responder preguntas específicas.
Proporciona análisis profundos basados en datos del mercado real.
Sé honesto sobre viabilidad, pero también constructivo en tus críticas.`;

  const userMessage = `Evalúa esta idea de negocio:

${idea}

Responde estas preguntas específicas:
${questions.map((q, i) => `${i + 1}. ${q}`).join("\n")}

Proporciona análisis detallado y recomendaciones.`;

  console.log("\n✅ Validando idea de negocio...\n");

  const stream = await client.messages.stream({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 1024,
    system: systemPrompt,
    messages: [
      {
        role: "user",
        content: userMessage,
      },
    ],
  });

  let fullResponse = "";

  for await (const chunk of stream) {
    if (
      chunk.type === "content_block_delta" &&
      chunk.delta.type === "text_delta"
    ) {
      const text = chunk.delta.text;
      process.stdout.write(text);
      fullResponse += text;
    }
  }

  console.log("\n");
  return fullResponse;
}

async function main() {
  console.log("═══════════════════════════════════════════════════════════");
  console.log("🚀 GENERADOR DE IDEAS DE NEGOCIO CON VALIDACIÓN");
  console.log("═══════════════════════════════════════════════════════════");
  console.log("\nBienvenido. Soy Yara, tu experto en desarrollo de negocios.");
  console.log("Voy a ayudarte a generar y validar ideas de negocio viables.\n");

  try {
    // Obtener información del usuario
    const industry = await question("¿En qué industria te interesa? ");
    const budget = await question(
      "¿Cuál es tu presupuesto inicial aproximado? "
    );
    const skills = await question(
      "¿Cuáles son tus principales habilidades? (separadas por comas) "
    );

    // Generar idea de negocio
    const businessIdea = await generateBusinessIdea(industry, budget, skills);

    // Preguntas de validación
    console.log("\n═══════════════════════════════════════════════════════════");
    console.log("VALIDACIÓN DE LA IDEA");
    console.log("═══════════════════════════════════════════════════════════");

    const validationQuestions = [
      "¿Cuál es el tamaño real del mercado para este tipo de negocio?",
      "¿Quiénes serían los principales competidores y cuáles son sus ventajas?",
      "¿Cuál sería la estrategia de entrada al mercado más efectiva?",
      "¿Cuáles son los KPIs más importantes a monitorear en los primeros 6 meses?",
    ];

    const validation = await validateIdea(businessIdea, validationQuestions);

    // Obtener siguientes pasos
    console.log("\n═══════════════════════════════════════════════════════════");
    console.log("PLAN DE ACCIÓN");
    console.log("