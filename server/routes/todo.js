const express = require('express');
// const {transactionProvider} = require('../db/knex');
const router = express.Router();

const knex = require('../db/knex');

/* This router is mounted at http://localhost:3000/todo */
router.get('/', (req, res) => {
    knex('todo')
        .select()
        .then(todos => {
            res.render('all', {todos: todos});
        });
});

router.get('/new', (req, res) => {
    res.render('new');
});

function respondAndRenderTodo(id, res, viewName) {
    if (typeof id != 'undefined') {
        knex('todo')
            .select()
            .where('id', id)
            .first()
            .then(todo => {
                console.log('todo', todo);
                res.render(viewName, todo);
            });
    } else {
        // respond with an error
        res.status(500);
        res.render('error', {
            message: 'invalid id'
        });
    }

}

router.get('/:id', (req, res) => {
    const id = req.params.id;
    respondAndRenderTodo(id, res, 'single');
});

router.get('/:id/edit', (req, res) => {
    // get the todo with the id in the url
    const id = req.params.id;
    respondAndRenderTodo(id, res, 'edit');
});

function validTodo(todo) {
    return typeof todo.title == 'string' &&
        todo.title.trim() !== '' &&
        typeof todo.priority !== 'undefined' &&
        !isNaN(Number(todo.priority));
}

function validateTodoInsertUpdateRedirect(req, res, callback) {
    if (validTodo(req.body)) {
        const todo = {
            title: req.body.title,
            description: req.body.description,
            priority: req.body.priority,
        };

        callback(todo);
    } else {
        // respond with an error
        res.status(500);
        res.render('error', {
            message: 'invalid todo'
        });
    }
}

router.post('/', (req, res) => {
    console.log(req.body);
    validateTodoInsertUpdateRedirect(req, res, (todo) => {
        todo.date = new Date()
        // insert into the database
        knex('todo')
            .insert(todo, 'id')
            .then(ids => {
                const id = ids[0];
                res.redirect(`/todo/${id}`);
            });
    });
});

router.put('/:id', (req, res) => {
    validateTodoInsertUpdateRedirect(req, res, (todo) => {
        // insert into the database
        knex('todo')
            .where('id', req.params.id)
            .update(todo, 'id')
            .then(() => {
                res.redirect(`/todo/${req.params.id}`);
            });
    });
})

module.exports = router;
