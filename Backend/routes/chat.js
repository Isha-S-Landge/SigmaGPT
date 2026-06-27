import express from 'express';
import Thread from '../models/Thread.js';
import getgenerativeAIResponse from '../utils/generativeai.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Get all threads for logged in user
router.get("/threads", authMiddleware, async (req, res) => {
    try {
        const threads = await Thread.find({ userId: req.user.userId });
        threads.sort((a, b) => b.createdAt - a.createdAt);
        res.json(threads);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get messages by threadId
router.get("/threads/:threadId", authMiddleware, async (req, res) => {
    try {
        const thread = await Thread.findOne({
            threadId: req.params.threadId,
            userId: req.user.userId
        });
        if (!thread) {
            return res.status(404).json({ error: "Thread not found" });
        }
        res.json(thread.messages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete thread by threadId
router.delete("/threads/:threadId", authMiddleware, async (req, res) => {
    try {
        const thread = await Thread.findOneAndDelete({
            threadId: req.params.threadId,
            userId: req.user.userId
        });
        if (!thread) {
            return res.status(404).json({ error: "Thread not found" });
        }
        res.json({ message: "Thread deleted successfully!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete all threads for logged in user
router.delete("/threads", authMiddleware, async (req, res) => {
    try {
        await Thread.deleteMany({ userId: req.user.userId });
        res.json({ message: "All threads deleted successfully!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✅ Rename thread
router.patch("/threads/:threadId/rename", authMiddleware, async (req, res) => {
    try {
        const thread = await Thread.findOneAndUpdate(
            { threadId: req.params.threadId, userId: req.user.userId },
            { title: req.body.title },
            { new: true }
        );
        if (!thread) {
            return res.status(404).json({ error: "Thread not found" });
        }
        res.json({ message: "Thread renamed successfully!", thread });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Chat
router.post("/chat", authMiddleware, async (req, res) => {
    const { threadId, message } = req.body;

    if (!threadId || !message) {
        return res.status(400).json({ error: "threadId and message are required" });
    }
    try {
        let thread = await Thread.findOne({ threadId, userId: req.user.userId });
        if (!thread) {
            thread = new Thread({
                userId: req.user.userId,
                threadId,
                title: message,
                messages: [{
                    role: "user",
                    content: message
                }]
            });
        } else {
            thread.messages.push({
                role: "user",
                content: message
            });
        }
        const assistantResponse = await getgenerativeAIResponse(message);
        thread.messages.push({
            role: "assistant",
            content: assistantResponse
        });
        thread.updatedAt = new Date();
        await thread.save();
        res.json({ reply: assistantResponse });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Internal server error" });
    }
});

export default router;