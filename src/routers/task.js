const express = require('express');
const Task = require('../models/task');
const router = new express.Router();
const auth = require('../middleware/auth');

//  TASKS
router.get('/task', auth, async (req, res) => {
    const match = {};
    const filter = {};

    if (req.query.sortBy) {
        let parsed = req.query.sortBy.split('_');
        console.log(parsed);
        filter[parsed[0]] = parsed[1];
        console.log(filter);
    }

    if (req.query.completed) {
        match.completed = req.query.completed === 'true';
    }

    try {
        const task = await Task.find({
            owner: req.user._id,
            ...match,
        })
            .limit(parseInt(req.query.limit))
            .skip(parseInt(req.query.skip))
            .sort(filter);

        res.status(201).send(task);
    } catch (e) {
        res.status(500).send;
    }
});

router.get('/task/:id', auth, async (req, res) => {
    //dynamic routing
    const _id = req.params.id;

    try {
        const task = await Task.findOne({
            _id,
            owner: req.user._id,
        });
        if (!task) return res.status(404).send();
        res.send(task);
    } catch (error) {
        res.status(500).send(e);
    }
});

router.post('/task', auth, async (req, res) => {
    console.log(req.body);
    const task = new Task({
        ...req.body,
        owner: req.user._id,
    });
    console.log(task);
    try {
        await task.save();
        res.status(201).send(task);
    } catch (error) {
        res.status(400).send(e.message);
    }
});

// PATCHING TASKS
router.patch('/task/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['description', 'completed'];
    const isValidOperation = updates.every((update) =>
        allowedUpdates.includes(update)
    );
    if (!isValidOperation)
        return res.status(400).send({ error: 'Invalid updates' });
    try {
        const task = await Task.findOne({
            _id: req.params.id,
            owner: req.user._id,
        });

        if (!task) return res.sendStatus(404);

        updates.forEach((update) => (task[update] = req.body[update]));

        await task.save();
        res.send(task);
    } catch (error) {
        console.log(error);
        res.send(error);
    }
});

// DELETING TASKS

router.delete('/task/:id', auth, async (req, res) => {
    console.log(req.params.id);
    try {
        const task = await Task.findOneAndDelete({
            _id: req.params.id,
            owner: req.user._id,
        });
        if (!task) return res.sendStatus(404);
        res.send(task);
    } catch (error) {
        res.sendStatus(500);
    }
});

module.exports = router;
