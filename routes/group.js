const express = require('express')
const router = express.Router()
const Joi = require('joi')
const { isUser } = require('../middleware/auth')

const { User, Discussions, Comments } = require('../models')
const { Group_members } = require('../models')
const { Group } = require('../models')
const { Invitations } = require('../models')
const { Notifications } = require('../models')

router.post('/', isUser, async (req, res) => {
    try {
        const schema = Joi.object({
            name: Joi.string().min(3).max(40).required(),
            description: Joi.string().min(10).required()
        })

        const { error } = schema.validate(req.body)
        if (error) {
            return res.status(400).json({
                error: error.details[0].message
            })
        }
        const userId = parseInt(req.user.id)
        const { name, description } = req.body

        // Check if the group exists
        const existingGroup = await Group.findOne({ where: { name } })
        if (existingGroup) {
            return res.status(409).json({
                error: "Group already exists"
            })
        }

        // Create a group
        const group = await Group.create({
            name,
            description,
            creator_id: userId
        })

        // Make the creator a member of the group by updating the groups_members table
        if (group) {
            await Group_members.create({
                group_id: group.id,
                user_id: group.creator_id
            })
            res.status(201).json({
                message: `Group with name ${group.name} created successfully`,
                group
            })
        }
    } catch (error) {
        console.error("Error occured while creating the group:", error)
        res.status(500).json({
            error: 'Error occured while creating the group'
        })
    }
})

router.get('/', isUser, async (req, res) => {
    try {
        const groups = await Group.findAll()
        const allGroups = await Promise.all(groups.map(async (group) => {
            const creator = await User.findOne({ where: { id: group.creator_id } });
            const { id, name, description, creator_id, createdAt } = group;
            const details = {
                id,
                name,
                description,
                creator_id,
                creatorName: creator.name,
                createdAt
            };
            return details;
        }));
        res.status(200).json(allGroups)
    } catch (error) {
        console.error("Error fetching all groups:", error)
        res.status(500).json({
            error: 'Error fetching all groups'
        })
    }
})

router.get('/get-group-detail/:groupId', isUser, async (req, res) => {
    try {
        const userId = parseInt(req.user.id)
        const groupID = parseInt(req.params.groupId)
        // Check if the user is a group member by querying the group-members table
        const isMemmber = await Group_members.findOne({ where: { user_id: userId, group_id: groupID } })

        if (!isMemmber) {
            return res.status(400).json({
                error: `User with id ${userId} is not a member of Group with id ${groupID}`
            })
        }
        // Get all the group information including its member details
        const groupDetails = await Group.findOne({
            where: {
                id: groupID
            },
            attributes: ['name', 'description', 'creator_id'],
            include: [
                {
                    model: Group_members,
                    attributes: ['user_id'],
                    include: [
                        {
                            model: User,
                            attributes: ['name', 'email', 'username', 'profile_picture', 'country', 'sex', 'hobbies']
                        }
                    ]
                }
            ]
        })

        res.status(200).json({
            message: "Group details returned successfully",
            groupDetails
        })
    } catch (error) {
        console.error("Error occured while returning group details:", error)
        res.status(500).json({
            error: 'Error occured while returning group details'
        })
    }
})

router.post('/join-a-group/:groupId', isUser, async (req, res) => {
    const userId = parseInt(req.user.id)
    const groupID = parseInt(req.params.groupId)
    const user = await User.findByPk(userId)
    const group = await Group.findByPk(groupID)
    try {
        // Check if the user is already a member of the group
        const isMember = await Group_members.findOne({
            where: {
                group_id: groupID,
                user_id: user.id
            }
        })
        if (isMember) {
            return res.status(400).json({
                error: `User with name ${user.name} and id ${user.id} is already a member of ${group.name} group`
            })
        }
        const member = await Group_members.create({
            group_id: group.id,
            user_id: user.id
        })
        if (member) {
            res.status(200).json({
                message: `User with name ${user.name} and id ${user.id} has joined ${group.name} group`
            })
        } else {
            return res.status(400).json({
                error: "Error occured while joining the group"
            })
        }
    } catch (error) {
        console.error("Error occured while joining the group:", error)
        res.status(500).json({
            error: 'Error occured while joining the group'
        })
    }
})

router.patch('/:groupId', isUser, async (req, res) => {
    const userId = parseInt(req.user.id)
    const groupID = parseInt(req.params.groupId)

    const user = await User.findByPk(userId)
    const group = await Group.findByPk(groupID)
    if (!group) {
        return res.status(400).json({
            error: `Group with id ${groupID} does not exist`
        })
    }
    const schema = Joi.object({
        name: Joi.string().min(3).max(40).required(),
        description: Joi.string().min(10).required()
    })

    const { error } = schema.validate(req.body)
    if (error) {
        return res.status(400).json({
            error: error.details[0].message
        })
    }

    const { name, description } = req.body
    try {
        if (user.id === group.creator_id) {
            group.name = name
            group.description = description

            await group.save()
            res.status(200).json({
                message: "Group updated successfully",
                group
            })
        } else {
            return res.status(400).json({
                error: "you cannot update this group as you are not the creator"
            })
        }
    } catch (error) {
        console.error("Error occured while updating the group:", error)
        res.status(500).json({
            error: 'Error occured while updating the group'
        })
    }
})

router.post('/send-invitation/:groupId', isUser, async (req, res) => {
    const userId = parseInt(req.user.id)
    const groupID = parseInt(req.params.groupId)

    const schema = Joi.object({
        username: Joi.string().min(3).max(200).required(),
    })

    const { error } = schema.validate(req.body)
    if (error) {
        return res.status(400).json({
            error: error.details[0].message
        })
    }
    const { username } = req.body
    // Get the group 
    const group = await Group.findByPk(groupID)
    // Get the user
    const user = await User.findByPk(userId)
    if (!group) {
        return res.status(400).json({
            error: `Group with id ${groupID} is not found`
        })
    }
    try {
        // Check if the user is the creator of the group
        if (group.creator_id === user.id) {
            // Get the id of the receiver based on the username
            const receiver = await User.findOne({ where: { username } })
            if (!receiver) {
                return res.status(400).json({
                    error: `User with username ${username} does not exist`
                })
            }
            // Check if the receiver is already a member of the group
            const isMember = await Group_members.findOne({
                where: {
                    group_id: groupID,
                    user_id: receiver.id
                }
            })
            if (isMember) {
                return res.status(400).json({
                    error: `User with name ${receiver.name} and id ${receiver.id} is already a member of ${group.name} group`
                })
            }
            // Check if the receiver has already been sent an invite
            const inviteAlreadySent = await Invitations.findOne({
                where: {
                    sender_id: user.id,
                    receiver_id: receiver.id,
                    group_id: group.id
                }
            })
            if (inviteAlreadySent) {
                return res.status(400).json({
                    error: `User with name ${receiver.name} has already received an invite to join ${group.name} group`
                })
            }
            // Send the invitation to the receiver
            const invitation = await Invitations.create({
                sender_id: user.id,
                receiver_id: receiver.id,
                group_id: group.id
            })
            if (!invitation) {
                return res.status(400).json({
                    error: "Error occured and could not send the invitation"
                })
            }
            // Send notification to the receiver
            const notification = await Notifications.create({
                sender_id: user.id,
                receiver_id: receiver.id,
                group_id: group.id,
                content: "You have an invitation waiting for your action",
                status: "unread"
            })
            if (!notification) {
                return res.status(400).json({
                    error: "Error occured and could not send the notification"
                })
            }
            res.status(201).json({
                message: `Invitation has been sent to the user with username ${username}`
            })
        } else {
            return res.status(400).json({
                error: `User with name ${user.name} is not the creator of the group with name ${group.name}`
            })
        }
    } catch (error) {
        console.error("Error occured while sending the invitation:", error)
        res.status(500).json({
            error: 'Error occured while sending the invitation'
        })
    }

})

router.post('/handle-invite-notification', isUser, async (req, res) => {
    const userId = parseInt(req.user.id)
    const schema = Joi.object({
        status: Joi.string().required(),
        groupId: Joi.number().required()
    })
    const { error } = schema.validate(req.body)
    if (error) {
        return res.status(400).json({
            error: error.details[0].message
        })
    }
    const { status, groupId } = req.body

    try {
        // Get the receiver id, sender id and group id from notifications table where status is unread
        const notification = await Notifications.findOne({
            where: {
                receiver_id: userId,
                group_id: groupId,
                status: 'unread'
            }
        })
        if (notification) {
            notification.status = "read"
            await notification.save()
            const { sender_id, receiver_id, group_id } = notification
            // Select from invitations table based on sender_id, receiver_id, group_id and status as pending
            const invitation = await Invitations.findOne({
                where: {
                    sender_id,
                    receiver_id,
                    group_id,
                    status: 'pending'
                }
            })
            if (invitation) {
                const { receiver_id, group_id } = invitation
                if (status === "accepted") {
                    invitation.status = "accepted"
                    await invitation.save()
                    // Make the receiver a member of the group
                    const member = await Group_members.create({
                        group_id,
                        user_id: receiver_id
                    })
                    if (member) {
                        res.status(200).json({
                            message: `User with id ${receiver_id} is now a member of group with id ${group_id}`
                        })
                    }
                }
                if (status === "declined") {
                    invitation.status = "declined"
                    await invitation.save()
                    res.status(200).json({
                        message: "We respect your decision to decline the invitation. Feel free to join whenever you like!"
                    })
                }
            }
        }
    } catch (error) {
        console.error("Error occured while responding to notification:", error)
        res.status(500).json({
            error: 'Error occured while responding to notification'
        })
    }
})

router.post('/discussion', isUser, async (req, res) => {
    const userId = parseInt(req.user.id)
    const schema = Joi.object({
        title: Joi.string().required(),
        content: Joi.string().required(),
        groupId: Joi.number().required()
    })
    const { error } = schema.validate(req.body)
    if (error) {
        return res.status(400).json({
            error: error.details[0].message
        })
    }
    const { title, content, groupId } = req.body

    try {
        const author = await User.findOne({ where: { id: userId } })
        if (!author) {
            return res.status(400).json({
                error: `User with id ${userId} does not exist`
            })
        }
        // Make sure group exists
        const group = await Group.findOne({ where: { id: groupId } })
        if (!group) {
            return res.status(400).json({
                error: `Group with id ${groupId} does not exist, specify the right group to start discussion on`
            })
        }
        // Check if the user is a member of the group
        const member = await Group_members.findOne({ where: { group_id: groupId, user_id: userId } })
        if (!member) {
            return res.status(400).json({
                error: `User with id ${userId} is not a member of the group with id ${groupId}. Join the group to start a discussion`
            })
        }
        // Create a discussion
        const discussion = await Discussions.create({
            title,
            content,
            author_id: userId,
            group_id: groupId
        })
        if (discussion) {
            // Get all the members in this group and send them notifications
            const members = await Group_members.findAll({ where: { group_id: discussion.group_id } })
            await Promise.all(members.map(async (member) => {
                const user = member.user_id
                await Notifications.create({
                    sender_id: discussion.author_id,
                    receiver_id: user,
                    group_id: discussion.group_id,
                    discussion_id: discussion.id,
                    content: `${author.username} has started a discussion with title ${discussion.title}`,
                    status: 'unread'
                })
            }))
            res.status(201).json({
                message: `Discussion with title ${discussion.title} has been created and notifications sent to all group members`
            })
        }
    } catch (error) {
        console.error("Error occured while creating the discussion:", error)
        res.status(500).json({
            error: 'Error occured while creating the discussion'
        })
    }
})

router.get('/discussions/:groupId', isUser, async (req, res) => {
    const userId = parseInt(req.user.id)
    const groupId = parseInt(req.params.groupId)
    // Make sure group exists
    const group = await Group.findOne({ where: { id: groupId } })
    if (!group) {
        return res.status(400).json({
            error: `Group with id ${groupId} does not exist`
        })
    }
    // Check if the user is a member of the group
    const member = await Group_members.findOne({ where: { group_id: groupId, user_id: userId } })
    if (!member) {
        return res.status(400).json({
            error: `User with id ${userId} is not a member of the group with id ${groupId}. Join the group to see discussions`
        })
    }

    try {
        // Get all discussions
        const discussions = await Discussions.findAll({
            where: {
                group_id: groupId
            },
            attributes: ['id', 'title', 'content', 'author_id'],
            include: [
                {
                    model: Comments,
                    attributes: ['content', 'author_id', 'discussion_id', 'likes', 'dislikes'],
                    include: [
                        {
                            model: User,
                            attributes: ['name', 'email', 'username', 'profile_picture', 'country', 'sex', 'hobbies']
                        }
                    ]
                }
            ]
        })

        res.status(200).json({
            message: "Discussion details returned successfully",
            discussions
        })
    } catch (error) {
        console.error("Error occured while getting all discussions:", error)
        res.status(500).json({
            error: 'Error occured while getting all discussions'
        })
    }
})

router.get('/discussions/:groupId/:discussionId/comments', isUser, async (req, res) => {
    const userId = parseInt(req.user.id)
    const groupId = parseInt(req.params.groupId)
    const discussionId = parseInt(req.params.discussionId)
    // Make sure group exists
    const group = await Group.findOne({ where: { id: groupId } })
    if (!group) {
        return res.status(400).json({
            error: `Group with id ${groupId} does not exist`
        })
    }
    // Check if the user is a member of the group
    const member = await Group_members.findOne({ where: { group_id: groupId, user_id: userId } })
    if (!member) {
        return res.status(400).json({
            error: `User with id ${userId} is not a member of the group with id ${groupId}. Join the group to see discussions`
        })
    }
    // Check if discussion exists
    const discussion = await Discussions.findByPk(discussionId)
    if (!discussion) {
        return res.status(400).json({
            error: `Discussion with id ${discussionId} does not exist`
        })
    }

    try {
        // Get the discussion with discussionId and its comments
        const discussion = await Discussions.findOne({
            where: {
                id: discussionId
            },
            attributes: ['id', 'title', 'content', 'author_id'],
            include: [
                {
                    model: Comments,
                    attributes: ['id', 'content', 'author_id', 'discussion_id', 'likes', 'dislikes'],
                    include: [
                        {
                            model: User,
                            attributes: ['name', 'email', 'username', 'profile_picture', 'country', 'sex', 'hobbies']
                        }
                    ]
                }
            ]
        })
        res.status(200).json({
            message: "Discussion details returned successfully",
            discussion
        })
    } catch (error) {
        console.error("Error occured while getting the discussion:", error)
        res.status(500).json({
            error: 'Error occured while getting the discussion'
        })
    }

})

router.get('/discussions/:groupId/:discussionId/comments/:commentId', isUser, async (req, res) => {
    const userId = parseInt(req.user.id)
    const groupId = parseInt(req.params.groupId)
    const discussionId = parseInt(req.params.discussionId)
    const commentId = parseInt(req.params.commentId)
    // Make sure group exists
    const group = await Group.findOne({ where: { id: groupId } })
    if (!group) {
        return res.status(400).json({
            error: `Group with id ${groupId} does not exist`
        })
    }
    // Check if the user is a member of the group
    const member = await Group_members.findOne({ where: { group_id: groupId, user_id: userId } })
    if (!member) {
        return res.status(400).json({
            error: `User with id ${userId} is not a member of the group with id ${groupId}. Join the group to see discussions`
        })
    }
    // Check if discussion exists
    const discussion = await Discussions.findByPk(discussionId)
    if (!discussion) {
        return res.status(400).json({
            error: `Discussion with id ${discussionId} does not exist`
        })
    }

    // Check if comment exists
    const comment = await Comments.findByPk(commentId)
    if (!comment) {
        return res.status(400).json({
            error: `Comment with id ${commentId} does not exist`
        })
    }
    try {
        const result = await Discussions.findOne({
            where: {
                id: discussionId
            },
            include: {
                model: Comments,
                attributes: ['id', 'content', 'author_id', 'discussion_id', 'likes', 'dislikes'],
                where: {
                    id: commentId
                }
            }
        })
        res.status(200).json({
            message: "Discussion with a particular comment returned successfully",
            result
        })
    } catch (error) {
        console.error("Error occured while getting the discussion:", error)
        res.status(500).json({
            error: 'Error occured while getting the discussion'
        })
    }
})

// Make a comment
router.post('/comment', isUser, async (req, res) => {
    const userId = parseInt(req.user.id)
    const schema = Joi.object({
        content: Joi.string().required(),
        discussion_id: Joi.number().required(),
        likes: Joi.number(),
        dislikes: Joi.number()
    })

    const { error } = schema.validate(req.body)
    if (error) {
        return res.status(400).json({
            error: error.details[0].message
        })
    }

    // Get the user
    const user = await User.findByPk(userId)

    const { content, discussion_id, likes, dislikes } = req.body
    // Check if discussion exists
    const discussion = await Discussions.findByPk(discussion_id)
    if (!discussion) {
        return res.status(400).json({
            error: `Discussion with id ${discussion_id} does not exist`
        })
    }
    // Check if the user is a member of the group that the disucssion belongs to
    const member = await Group_members.findOne({ where: { group_id: discussion.group_id, user_id: userId } })
    if (!member) {
        return res.status(400).json({
            error: `User with id ${userId} is not a member of the group with id ${discussion.group_id}`
        })
    }
    try {
        const comment = await Comments.create({
            content,
            author_id: userId,
            discussion_id,
            likes,
            dislikes
        })
        // Notify the author that someone has reacted to the discussion he created
        if (comment) {
            await Notifications.create({
                sender_id: userId,
                receiver_id: discussion.author_id,
                group_id: discussion.group_id,
                discussion_id: discussion.id,
                content: `${user.username} has reacted to ${discussion.title} you created`,
                status: 'unread'
            })
            res.status(200).json(comment)
        }
    } catch (error) {
        console.error("Error occured while making comment:", error)
        res.status(500).json({
            error: 'Error occured while making comment'
        })
    }
})

router.delete('/:groupId', isUser, async (req, res) => {
    const userId = parseInt(req.user.id)
    const groupID = parseInt(req.params.groupId)
    const user = await User.findByPk(userId)
    const group = await Group.findByPk(groupID)
    const groupMembers = await Group_members.findOne({ where: { group_id: groupID } })
    try {
        // Check if the user is the creator of the group
        if (user.id === group.creator_id) {
            // First of all delete the members associated with the group
            if (groupMembers.group_id != null) {
                const deletedMembers = await Group_members.destroy({ where: { group_id: groupID } })
                if (deletedMembers) {
                    // Delete the group
                    const deletedGroup = await Group.destroy({ where: { id: groupID } })
                    if (deletedGroup === 1) {
                        res.status(200).json({
                            message: `Group with id ${groupID} and its members have been deleted`
                        })
                    }
                } else {
                    return res.status(400).json({
                        error: `Error deleting the group`
                    })
                }
            }
        } else {
            return res.status(400).json({
                error: `User with id ${user.id} is not the creator of the group ${groupID}`
            })
        }
    } catch (error) {
        console.error("Error occured while deleting the group:", error)
        res.status(500).json({
            error: 'Error occured while deleting the group'
        })
    }
})

module.exports = router