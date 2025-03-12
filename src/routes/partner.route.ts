import express from 'express'
import { PartnerController } from "../controllers/partner.controller"

const partnerController = new PartnerController()

const router = express.Router()

router.get('/', partnerController.searchPartners)
router.post('/', partnerController.createPartner)
router.get('/:id', partnerController.getPartnerById)
router.put('/:id', partnerController.updatePartner)
router.delete('/:id', partnerController.deletePartner)

export const partnerRouter = router