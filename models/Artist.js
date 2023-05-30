const mongoose = require("mongoose");

const artistSchema = new mongoose.Schema({
  artist_name: { type: String, required: true },
    genre: { type: String },
    biography: { type: String },

    banner: { type: String },
    photos: [{ type: String }],
    socialMedia: {
      facebook: { type: String },
      instagram: { type: String },
      twitter: { type: String },
      youtube: { type: String }
    },
    contact: {
      email: { type: String },
      phone: { type: String }
    },
    discography: [{
      title: { type: String },
      releaseDate: { type: Date }
    }],
    streamingLinks: [{ type: String }],
    awards: [{ type: String }]
  });

  const Artist = mongoose.model('Artist', artistSchema);

module.exports = Artist;