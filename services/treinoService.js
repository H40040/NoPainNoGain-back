// backend/services/treinoService.js
const Treino = require("../models/treinoModel");

const saveWorkout = async (userId, data, treinoGerado) => {
   try {
       const novoTreino = new Treino({ userId, ...data, treinoGerado });
       await novoTreino.save();
       return true; // Save successful
   } catch (dbError) {
       console.error("Erro ao salvar o treino no banco de dados:", dbError);
       return false; // Save failed
   }
};

module.exports = {saveWorkout}
