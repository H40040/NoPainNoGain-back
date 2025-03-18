// backend/controllers/treinoController.js
const Treino = require("../models/treinoModel");
const axios = require("axios");
const path = require("path");
const treinoService = require('../services/treinoService');
const { saveWorkout } = treinoService;

// Reusable error handler
const handleServerError = (res, error) => {
    console.error('Erro:', error);
    res.status(500).json({ sucesso: false, erro: 'Erro interno no servidor' });
};

// Function to format the user data for the prompt
const formatPromptData = (data) => {
    let dataPrompt = `## Informações do Aluno\n`;
    dataPrompt += data.nome ? `Nome: ${data.nome}\n` : '';
    dataPrompt += data.idade ? `Idade: ${data.idade}\n` : '';
    dataPrompt += data.peso ? `Peso: ${data.peso} kg\n` : '';
    dataPrompt += data.altura ? `Altura: ${data.altura} cm\n` : '';
    dataPrompt += data.historico ? `Histórico de Lesões e Doenças: ${data.historico}\n` : '';
    dataPrompt += data.queixas ? `Queixas, Sintomas e Preocupações: ${data.queixas}\n` : '';
    dataPrompt += data.habitos ? `Hábitos: ${data.habitos}\n` : '';
    dataPrompt += data.medicamentos ? `Uso de Medicamentos e Suplementos: ${data.medicamentos}\n` : '';
    dataPrompt += `Objetivos Específicos: ${data.objetivos}\n\n`;
    dataPrompt += `## Informações do Treino\n`;
    dataPrompt += `Frequência: ${data.frequencia}x por semana\n`;
    dataPrompt += `Duração: ${data.duracao} min\n`;
    dataPrompt += `Nível: ${data.nivel}\n`;
    dataPrompt += data.preferencias ? `Preferências: ${data.preferencias}\n` : '';
    dataPrompt += `\n## Gerar treino personalizado.\n`;
    return dataPrompt;
};

// Function to generate the workout plan using the Gemini API
const generateWorkout = async (prompt) => {
    try {
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
            JSON.stringify({
              model: "models/gemini-1.5-flash",
              "contents": [{
                  "parts": [{
                      "text": `${prompt}`
                    }]
                }
                ]
            }),
            {
              headers: {
                'Content-Type': 'application/json'
              }
            }
        );
        if(!response.status === 200){
            console.error("Erro na API Gemini:", response.data || response.message);
            return null;
        }
        return response.data.candidates?.[0]?.content?.parts?.[0]?.text || null;
    } catch (apiError) {
        console.error("Erro na API Gemini:", apiError.response?.data || apiError.message);
        return null;
    }
};


exports.gerarTreino = async (req, res) => {
    let treinoGerado = null;
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(400).json({ sucesso: false, erro: 'User ID não encontrado no token.' });
        }
        const data = req.body;

        // Check if the user already has a workout this month
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        const endOfMonth = new Date();
        endOfMonth.setMonth(endOfMonth.getMonth() + 1, 0);
        endOfMonth.setHours(23, 59, 59, 999);
        const existingTreino = await Treino.findOne({
            userId: userId,
            createdAt: {
                $gte: startOfMonth,
                $lte: endOfMonth
            }
        });

        if (existingTreino) {
            return res.status(400).json({ sucesso: false, erro: 'Você já gerou um treino este mês. Tente novamente no próximo mês.' });
        }

        const dataPrompt = formatPromptData(data);
        const prompt = JSON.stringify(dataPrompt);
        treinoGerado = await generateWorkout(prompt);

        if(treinoGerado){
            const saved = await saveWorkout(userId, data, treinoGerado);
            if(!saved) return res.status(500).json({ sucesso: false, erro: "Erro ao salvar o treino no banco de dados." });
            res.json({ sucesso: true, treinoGerado, message: "Workout generated and saved successfully!" });
        }
        else{
            res.status(500).json({ sucesso: false, erro: "Erro ao gerar treino." });
        }
    } catch (error) {
        handleServerError(res, error);
    }
};

exports.listTreinos = async (req, res) => {
  try {
      const userId = req.userId;
      const treinos = await Treino.find({ userId });
      if(!treinos || treinos.length == 0){
          return res.status(404).json({ sucesso: true, message: "Não foi encontrado nenhum treino." });
      }
      res.json({ success: true, treinos });
  } catch (error) {
      handleServerError(res, error);
  }
};
