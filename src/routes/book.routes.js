const express = require('express');
const router = express.Router();
const Book = require('../models/book.model');

// MIDDLEWARE - Para tomar un solo libro y después esa función será utilizada en otras llamadas
const getBook = async (req, res, next) => {
    let book;
    const { id } = req.params;

    // Que mire si es un id válido (si tiene una config de Mongo correcta)
    if(!id.match(/^[0-9a-fA-F]{24}$/)){ // tipo ID de Mongo
        return res.status(404).json({
            message: 'El ID del libro no es válido'
        });
    }

    // Si no lo encontró, pero es válido el número
    try {
        book = await Book.findById(id);
        if(!book){
            return res.status(404).json({
                message: 'El libro no fue encontrado'
            });
        }
    } catch (error) {
        // Error por si falla la BBDD
        return res.status(500).json({
            message: error.message
        });
    }

    res.book = book;

    // Para que siga
    next();
};

// GET - Obtenemos todos los libros
router.get('/', async (req, res) => {
    try {
        // Traemos todos los libros
        const books = await Book.find();
        console.log('GET ALL', books);

        if (books.length === 0) {
            // Si no encuentra ningún libro
            return res.status(204).json([]);
        }

        // Respuesta
        res.json(books);
    } catch (error) {
        // Si hay problemas con la BBDD
        res.status(500).json({ message: error.message });
    }
});

// POST - Crear un nuevo libro (crear recurso)
router.post('/', async (req, res) => {
    // Trae un body
    const {title, author, genre, publication_date} = req.body;
    // Si no vienen ninguna de estas
    if(!title || !author || !genre || !publication_date){
        return res.status(400).json({
            message: 'Los campos título, autor, género y fecha son obligatorios'
        });
    }

    // En el caso de que no sea así
    const book = new Book({
        title, 
        author, 
        genre, 
        publication_date
    });

    // Errores
    try {
        const newBook = await book.save();
        console.log(newBook);
        // Devolvemos el nuevo libro
        res.status(201).json(newBook);
    } catch (error) {
        return res.status(400).json({
            message: error.message
        });
    }
});

// GET individual - con el middleware
router.get('/:id', getBook, async(req, res) => {
    res.json(res.book);
});

//PUT - Modificar
router.put('/:id', getBook, async(req, res) => {
    try {
        //Agrega el book en la respuesta
        const book = res.book;

        //Elementos de Book, si no se cambia se deja el elemento original
        book.title = req.body.title || book.title;
        book.author = req.body.author || book.author;
        book.genre = req.body.genre || book.genre;
        book.publication_date = req.body.publication_date || book.publication_date;

        //Se hace el update
        const updateBook = await book.save();
        res.json(updateBook);

    } catch (error) {
        res.status(400).json({
            message: error.message
        })
    }
});

//PATCH - actualizar parcialmente un recurso en el servidor
router.patch('/:id', getBook, async(req, res) => {
    //Si no esta en el body alguno de los elemnentos de book
    if (!req.body.title && !req.body.author && !req.body.genre && !req.body.publication_date) {
        res.status(400).json({
            message: 'Rellena al menos uno de estos campos: Título, Autor, Género o Fecha de Publicación '
        })
    }

    try {
        const book = res.book;

        book.title = req.body.title || book.title;
        book.author = req.body.author || book.author;
        book.genre = req.body.genre || book.genre;
        book.publication_date = req.body.publication_date || book.publication_date;

        const updateBook = await book.save();
        res.json(updateBook);

    } catch (error) {
        res.status(400).json({
            message: error.message
        })
    }
});

//DELETE - Eliminar libro
router.delete('/:id', getBook, async(req, res) => {
        try {
            const book = res.book;
            await book.deleteOne({
                _id: book._id
            });
            res.json({
                message: `El libro ${book.title} fue eliminado correctamente`
            })

        } catch (error) {
            res.status(500).json({
                message: error.message
            })
        }

});


module.exports = router;
