const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const env =require('dotenv');
const app =express();
const usersRouter = require('express').Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const requestLogger =require('./middleWareLogger');
require('dotenv').config();
main().catch(err => console.log(err));

async function main() {
    await mongoose.connect(process.env.MONGODB_CONNECTION_URL).then(() => {
        console.log('Connected to the database');   
    }).catch((error) => {
        console.log('Error connecting to the database', error);
    });

    app.use(cors());
    app.use(express.json());
    app.use(requestLogger);

    const usersSchema = new mongoose.Schema({
        name: String,
        email: String,
        username: String,
        passwordHash: String
    });
    const User = mongoose.model('User', usersSchema);

    app.post('/users', async (req, res) => {
        try{
            const body =req.body;
            if(body === undefined){
                return res.status(400).send('Note is empty');
            }
            const { name,email,username, password } = req.body;
            const saltRounds = 10;
            const passwordHash = await bcrypt.hash(password, saltRounds);
            const user = new User({
                name,
                email,
                username,
                passwordHash,
            })
            try{
                const savedUser = await user.save();
                res.status(201).json(savedUser).end();
            }
            catch (error) {
                res.status(500);
            }
        } catch (error) {
            res.status(500);
        }
    });
    app.post('/login', async (req, res) => {
        try{
            const body =req.body;
            if(body === undefined){
                return res.status(400).send('Note is empty');
            }
            const { username, password } = req.body;
            const user = await User.findOne({ username});
            const passwordCorrect = user === null? false : await bcrypt.compare(password, user.passwordHash);
            if (!(user && passwordCorrect)) {
                return res.status(401).json({ error: 'Invalid username or password' });
            }
            const userForToken = {username: user.username,id: user._id}
            const token = jwt.sign(userForToken, process.env.SECRET);
            res.status(200).send({ token:token, name: user.name , email: user.email});
        } catch (error) {
        res.status(500);
        }
    });

    function getTokenFrom(request){
        const authorization = request.get('Authorization');
        if (authorization && authorization.startsWith('Bearer ')) {
          return authorization.replace('Bearer ', '');
        }
        return null;
    }


    const noteSchema = new mongoose.Schema({
        id: Number,
        title: String,
        author: {
            name: String,
            email: String,
        },
        content: String,
    });
    const Note = mongoose.model('Note', noteSchema);

    app.get('/document-count', async (req, res) => {
    try {
        const count = await Note.countDocuments({});
        res.json(count);   
    } catch (err) {
        res.status(500).json({ error: err.message });
}});

  //get all notes
  app.get('/notes', async (req, res) => {
    try {
      const page = parseInt(req.query._page) || 1;
      const limit = parseInt(req.query._limit) || 10;
      const skip = (page - 1) * limit;
      const notes = await Note.find().skip(skip).limit(limit);
      res.json(notes).status(201);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
  });

    //get note by id
    app.get('/notes/:id', async(request, response) => {
    const id = Number(request.params.id);
    const note = await Note.findOne({id: id});
    try{
        if (note) {
            response.json(note).status(201);
        }
        else{
            response.status(404).send('Note not found');
        }
    } catch (error) {
        response.status(500);
    }
    });

    //post a note
    app.post('/notes',async(request, response) => {
        try{
            const body =request.body;
            if(body === undefined){
                return response.status(400).send('Note is empty');
            }
            try{
            const decodedToken = jwt.verify(getTokenFrom(request), process.env.SECRET);
            if (!decodedToken.id) {
              return response.status(403).json({ error: 'token invalid' });
            }}
            catch (error) {
                return response.status(401).json({ error:  error + 'token missing or invalid' });
            }
            //const user = await User.findById(decodedToken.id)
            const note = new Note({
                id: body.id,
                title: body.title,
                author:body.author || null,
                content: body.content
            });
            try{
                const savedNote = await note.save();
                response.status(201).json(savedNote).end();
            }
            catch(error){response.status(500).send;}
        } catch (error) {
        response.status(500);
    }}) ;

    //update a note
    app.put('/notes/:id' ,async(request, response) => {
        try {
            const decodedToken = jwt.verify(getTokenFrom(request), process.env.SECRET);
            if (!decodedToken.id) {
                return response.status(403).json({ error: 'token invalid' });
            }
        } catch (error) {
            return response.status(401).json({ error: 'token missing or invalid' });
        }
        try{
            const body= request.body;
            const note={
                id: body.id,
                title: body.title,
                author:body.author || null,
                content: body.content
            }
            const updatedNote = await Note.updateOne({id: note.id}, note, { new: true } );
            if (updatedNote) {
                response.json(updatedNote).status(201).end();
            } else {
                response.status(404).send('Note not found');
            }
        } 
        catch (error) {
            console.error('Error updating note:', error);
            response.status(500).send('Error updating note');
        }});
   
    app.delete('/notes/:id', async(request, response) => {
        try {
            const decodedToken = jwt.verify(getTokenFrom(request), process.env.SECRET);
            if (!decodedToken.id) {
                return response.status(403).json({ error: 'token invalid' });
            }
        } catch (error) {
            return response.status(401).json({ error: 'token missing or invalid' });
        }
        try {
            const id = request.params.id;
            const deletedNote = await Note.deleteOne({id: id});
            if (deletedNote) {
                response.status(204).end();
            } else {
                response.status(500).send('Note not found');
            }
        } catch (error) {
            response.status(500).send(error);
        }
    });

    const PORT = 3001 ;
    app.listen(PORT, () =>{console.log(`Server running on port ${PORT}`); });
}