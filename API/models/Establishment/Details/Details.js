import mongoose from "mongoose";

const detailsSchema = new mongoose.Schema({
    // Campos genéricos que podem ser compartilhados entre todos os tipos de estabelecimentos
    // Se necessário, você pode adicionar campos comuns a todos os detalhes aqui
    // openingHours: [openingHoursSchema],
},
    {
        discriminatorKey: 'companyType', _id: false
    });


const Details = mongoose.model('Details', detailsSchema);

export default Details;
