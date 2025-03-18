// backend/controllers/subscriptionController.js
const SubscriptionPlan = require('../models/subscriptionPlanModel');
const UserSubscription = require('../models/userSubscriptionModel');
const User = require('../models/userModel');

// Reusable error handler
const handleServerError = (res, error) => {
    console.error('Erro:', error);
    res.status(500).json({ success: false, error: 'Erro interno no servidor' });
};

// ===== SUBSCRIPTION PLAN CONTROLLERS =====

// Get all subscription plans
exports.getAllPlans = async (req, res) => {
    try {
        const plans = await SubscriptionPlan.find({ isActive: true }).sort({ price: 1 });
        
        res.json({
            success: true,
            count: plans.length,
            plans
        });
    } catch (error) {
        handleServerError(res, error);
    }
};

// Get subscription plan by ID
exports.getPlanById = async (req, res) => {
    try {
        const plan = await SubscriptionPlan.findById(req.params.id);
        
        if (!plan) {
            return res.status(404).json({
                success: false,
                error: 'Plano de assinatura não encontrado'
            });
        }
        
        res.json({
            success: true,
            plan
        });
    } catch (error) {
        handleServerError(res, error);
    }
};

// Create new subscription plan (admin only)
exports.createPlan = async (req, res) => {
    try {
        const {
            name,
            description,
            price,
            duration,
            features,
            maxWorkouts,
            maxAIGeneration,
            discountPercentage
        } = req.body;
        
        const newPlan = new SubscriptionPlan({
            name,
            description,
            price,
            duration,
            features: features || [],
            maxWorkouts: maxWorkouts || 0,
            maxAIGeneration: maxAIGeneration || 0,
            discountPercentage: discountPercentage || 0
        });
        
        await newPlan.save();
        
        res.status(201).json({
            success: true,
            message: 'Plano de assinatura criado com sucesso',
            plan: newPlan
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const validationErrors = {};
            for (const key in error.errors) {
                validationErrors[key] = error.errors[key].message;
            }
            return res.status(400).json({
                success: false,
                error: 'Erro de validação',
                details: validationErrors
            });
        }
        handleServerError(res, error);
    }
};

// Update subscription plan (admin only)
exports.updatePlan = async (req, res) => {
    try {
        const {
            name,
            description,
            price,
            duration,
            features,
            maxWorkouts,
            maxAIGeneration,
            discountPercentage,
            isActive
        } = req.body;
        
        const plan = await SubscriptionPlan.findById(req.params.id);
        
        if (!plan) {
            return res.status(404).json({
                success: false,
                error: 'Plano de assinatura não encontrado'
            });
        }
        
        // Update fields
        if (name) plan.name = name;
        if (description) plan.description = description;
        if (price !== undefined) plan.price = price;
        if (duration) plan.duration = duration;
        if (features) plan.features = features;
        if (maxWorkouts !== undefined) plan.maxWorkouts = maxWorkouts;
        if (maxAIGeneration !== undefined) plan.maxAIGeneration = maxAIGeneration;
        if (discountPercentage !== undefined) plan.discountPercentage = discountPercentage;
        if (isActive !== undefined) plan.isActive = isActive;
        
        await plan.save();
        
        res.json({
            success: true,
            message: 'Plano de assinatura atualizado com sucesso',
            plan
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const validationErrors = {};
            for (const key in error.errors) {
                validationErrors[key] = error.errors[key].message;
            }
            return res.status(400).json({
                success: false,
                error: 'Erro de validação',
                details: validationErrors
            });
        }
        handleServerError(res, error);
    }
};

// Delete subscription plan (admin only)
exports.deletePlan = async (req, res) => {
    try {
        const plan = await SubscriptionPlan.findById(req.params.id);
        
        if (!plan) {
            return res.status(404).json({
                success: false,
                error: 'Plano de assinatura não encontrado'
            });
        }
        
        // Check if there are active subscriptions using this plan
        const activeSubscriptions = await UserSubscription.countDocuments({
            planId: plan._id,
            status: 'ativa'
        });
        
        if (activeSubscriptions > 0) {
            return res.status(400).json({
                success: false,
                error: 'Não é possível excluir um plano com assinaturas ativas',
                activeSubscriptions
            });
        }
        
        // Soft delete - just mark as inactive
        plan.isActive = false;
        await plan.save();
        
        res.json({
            success: true,
            message: 'Plano de assinatura desativado com sucesso'
        });
    } catch (error) {
        handleServerError(res, error);
    }
};

// ===== USER SUBSCRIPTION CONTROLLERS =====

// Get user's active subscription
exports.getUserSubscription = async (req, res) => {
    try {
        const userId = req.params.userId || req.userId;
        
        // Check if the requesting user is authorized
        if (req.userId !== userId && req.userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Não autorizado a acessar assinatura de outro usuário'
            });
        }
        
        const subscription = await UserSubscription.findOne({
            userId,
            status: 'ativa'
        }).populate('planId');
        
        if (!subscription) {
            return res.json({
                success: true,
                hasActiveSubscription: false,
                message: 'Usuário não possui assinatura ativa'
            });
        }
        
        res.json({
            success: true,
            hasActiveSubscription: true,
            subscription
        });
    } catch (error) {
        handleServerError(res, error);
    }
};

// Get user's subscription history
exports.getUserSubscriptionHistory = async (req, res) => {
    try {
        const userId = req.params.userId || req.userId;
        
        // Check if the requesting user is authorized
        if (req.userId !== userId && req.userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Não autorizado a acessar histórico de assinatura de outro usuário'
            });
        }
        
        const subscriptions = await UserSubscription.find({
            userId
        }).populate('planId').sort({ startDate: -1 });
        
        res.json({
            success: true,
            count: subscriptions.length,
            subscriptions
        });
    } catch (error) {
        handleServerError(res, error);
    }
};

// Create new subscription for user
exports.createSubscription = async (req, res) => {
    try {
        const userId = req.params.userId || req.userId;
        const { planId, paymentMethod, paymentDetails } = req.body;
        
        // Check if the requesting user is authorized
        if (req.userId !== userId && req.userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Não autorizado a criar assinatura para outro usuário'
            });
        }
        
        // Check if plan exists
        const plan = await SubscriptionPlan.findById(planId);
        if (!plan || !plan.isActive) {
            return res.status(404).json({
                success: false,
                error: 'Plano de assinatura não encontrado ou inativo'
            });
        }
        
        // Check if user already has an active subscription
        const existingSubscription = await UserSubscription.findOne({
            userId,
            status: 'ativa'
        });
        
        if (existingSubscription) {
            return res.status(400).json({
                success: false,
                error: 'Usuário já possui uma assinatura ativa',
                subscription: existingSubscription
            });
        }
        
        // Calculate end date based on plan duration
        const startDate = new Date();
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + plan.duration);
        
        // Create new subscription
        const newSubscription = new UserSubscription({
            userId,
            planId,
            startDate,
            endDate,
            paymentMethod,
            paymentDetails,
            status: 'ativa',
            price: plan.price,
            renewalCount: 0
        });
        
        await newSubscription.save();
        
        // Update user's subscription status
        await User.findByIdAndUpdate(userId, {
            subscriptionStatus: 'ativa',
            subscriptionPlan: plan.name
        });
        
        res.status(201).json({
            success: true,
            message: 'Assinatura criada com sucesso',
            subscription: newSubscription
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const validationErrors = {};
            for (const key in error.errors) {
                validationErrors[key] = error.errors[key].message;
            }
            return res.status(400).json({
                success: false,
                error: 'Erro de validação',
                details: validationErrors
            });
        }
        handleServerError(res, error);
    }
};

// Cancel user subscription
exports.cancelSubscription = async (req, res) => {
    try {
        const userId = req.params.userId || req.userId;
        const { reason } = req.body;
        
        // Check if the requesting user is authorized
        if (req.userId !== userId && req.userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Não autorizado a cancelar assinatura de outro usuário'
            });
        }
        
        // Find active subscription
        const subscription = await UserSubscription.findOne({
            userId,
            status: 'ativa'
        });
        
        if (!subscription) {
            return res.status(404).json({
                success: false,
                error: 'Assinatura ativa não encontrada'
            });
        }
        
        // Update subscription status
        subscription.status = 'cancelada';
        subscription.cancelDate = new Date();
        subscription.cancelReason = reason || 'Não informado';
        
        await subscription.save();
        
        // Update user's subscription status
        await User.findByIdAndUpdate(userId, {
            subscriptionStatus: 'inativa',
            subscriptionPlan: null
        });
        
        res.json({
            success: true,
            message: 'Assinatura cancelada com sucesso',
            subscription
        });
    } catch (error) {
        handleServerError(res, error);
    }
};

// Renew user subscription
exports.renewSubscription = async (req, res) => {
    try {
        const userId = req.params.userId || req.userId;
        const { planId, paymentMethod, paymentDetails } = req.body;
        
        // Check if the requesting user is authorized
        if (req.userId !== userId && req.userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Não autorizado a renovar assinatura de outro usuário'
            });
        }
        
        // Find current or previous subscription
        let subscription = await UserSubscription.findOne({
            userId,
            status: 'ativa'
        });
        
        // If no active subscription, check for expired ones
        if (!subscription) {
            subscription = await UserSubscription.findOne({
                userId,
                status: 'expirada'
            }).sort({ endDate: -1 });
        }
        
        // Determine which plan to use
        let plan;
        if (planId) {
            // User is changing plans
            plan = await SubscriptionPlan.findById(planId);
            if (!plan || !plan.isActive) {
                return res.status(404).json({
                    success: false,
                    error: 'Plano de assinatura não encontrado ou inativo'
                });
            }
        } else if (subscription) {
            // Use the same plan as before
            plan = await SubscriptionPlan.findById(subscription.planId);
            if (!plan || !plan.isActive) {
                return res.status(404).json({
                    success: false,
                    error: 'Plano de assinatura anterior não está mais disponível'
                });
            }
        } else {
            return res.status(400).json({
                success: false,
                error: 'É necessário especificar um plano para a assinatura'
            });
        }
        
        // If there's an active subscription, mark it as completed
        if (subscription && subscription.status === 'ativa') {
            subscription.status = 'concluída';
            await subscription.save();
        }
        
        // Calculate new dates
        const startDate = new Date();
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + plan.duration);
        
        // Create new subscription
        const newSubscription = new UserSubscription({
            userId,
            planId: plan._id,
            startDate,
            endDate,
            paymentMethod: paymentMethod || (subscription ? subscription.paymentMethod : 'cartão'),
            paymentDetails: paymentDetails || (subscription ? subscription.paymentDetails : {}),
            status: 'ativa',
            price: plan.price,
            renewalCount: subscription ? subscription.renewalCount + 1 : 0
        });
        
        await newSubscription.save();
        
        // Update user's subscription status
        await User.findByIdAndUpdate(userId, {
            subscriptionStatus: 'ativa',
            subscriptionPlan: plan.name
        });
        
        res.status(201).json({
            success: true,
            message: 'Assinatura renovada com sucesso',
            subscription: newSubscription
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const validationErrors = {};
            for (const key in error.errors) {
                validationErrors[key] = error.errors[key].message;
            }
            return res.status(400).json({
                success: false,
                error: 'Erro de validação',
                details: validationErrors
            });
        }
        handleServerError(res, error);
    }
};

// Check subscription status and update if expired
exports.checkSubscriptionStatus = async (req, res) => {
    try {
        const userId = req.params.userId || req.userId;
        
        // Find active subscription
        const subscription = await UserSubscription.findOne({
            userId,
            status: 'ativa'
        }).populate('planId');
        
        if (!subscription) {
            return res.json({
                success: true,
                hasActiveSubscription: false,
                message: 'Usuário não possui assinatura ativa'
            });
        }
        
        // Check if subscription has expired
        const now = new Date();
        if (now > subscription.endDate) {
            // Update subscription status
            subscription.status = 'expirada';
            await subscription.save();
            
            // Update user's subscription status
            await User.findByIdAndUpdate(userId, {
                subscriptionStatus: 'inativa',
                subscriptionPlan: null
            });
            
            return res.json({
                success: true,
                hasActiveSubscription: false,
                message: 'Assinatura expirada',
                subscription
            });
        }
        
        // Calculate remaining days
        const remainingDays = Math.ceil((subscription.endDate - now) / (1000 * 60 * 60 * 24));
        
        res.json({
            success: true,
            hasActiveSubscription: true,
            subscription,
            remainingDays
        });
    } catch (error) {
        handleServerError(res, error);
    }
};
