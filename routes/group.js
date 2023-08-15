const express = require('express')
const router = express.Router()
const Joi = require('joi')
const { isUser } = require('../middleware/auth')

const { User } = require('../models')
const { Group_members } = require('../models')
const { Group } = require('../models')

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
            message: "Group details return successfully",
            groupDetails
        })
    } catch (error) {
        console.error("Error occured while returning group details:", error)
        res.status(500).json({
            error: 'Error occured while returning group details'
        })
    }
})

module.exports = router