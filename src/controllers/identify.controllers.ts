import { Request, Response } from "express";
import { Contact, LinkPrecedence } from "../entities/contact";

class Identify {
  static async identify(req: Request, res: Response): Promise<void> {
    const { email, phoneNumber } = req.body;
        if (!email && !phoneNumber) {
            res.status(400).json({ error: "Email or phone number must be provided" });
            return;
        }
        try {
            const existingContacts = await Contact
                .createQueryBuilder('contact')
                .where('contact.email = :email OR contact.phoneNumber = :phoneNumber', { email, phoneNumber })
                .andWhere('contact.deletedAt IS NULL')
                .getMany();

            let primaryContact: Contact | undefined;
            let newSecondaryContacts: Contact[] = [];
            if (existingContacts.length > 0) {
                primaryContact = existingContacts.find(contact => contact.linkPrecedence === 'primary');
                if (!primaryContact) {
                    primaryContact = existingContacts[0]; // oldest becomes primary
                    primaryContact.linkPrecedence = LinkPrecedence.PRIMARY;
                    await Contact.save(primaryContact);
                }
                newSecondaryContacts = existingContacts.filter(contact => contact.linkPrecedence !== 'primary');
                for (const secondaryContact of newSecondaryContacts) {
                    if (secondaryContact.linkedId !== primaryContact.id) {
                        secondaryContact.linkedId = primaryContact.id;
                        secondaryContact.linkPrecedence = LinkPrecedence.SECONDARY;
                        await Contact.save(secondaryContact);
                    }
                }
            }

            if (!primaryContact) {
                primaryContact = new Contact();
                primaryContact.email = email || null;
                primaryContact.phoneNumber = phoneNumber || null;
                primaryContact.linkPrecedence = LinkPrecedence.PRIMARY;
                await Contact.save(primaryContact);
            } else {
                if (email && !existingContacts.some(c => c.email === email)) {
                    const newSecondary = new Contact();
                    newSecondary.email = email;
                    newSecondary.phoneNumber = phoneNumber || null;
                    newSecondary.linkedId = primaryContact.id;
                    newSecondary.linkPrecedence = LinkPrecedence.SECONDARY;
                    await Contact.save(newSecondary);
                    newSecondaryContacts.push(newSecondary);
                }

                if (phoneNumber && !existingContacts.some(c => c.phoneNumber === phoneNumber)) {
                    const newSecondary = new Contact();
                    newSecondary.phoneNumber = phoneNumber;
                    newSecondary.email = email || null;
                    newSecondary.linkedId = primaryContact.id;
                    newSecondary.linkPrecedence = LinkPrecedence.SECONDARY;
                    await Contact.save(newSecondary);
                    newSecondaryContacts.push(newSecondary);
                }
            }

            const emails = [
                primaryContact.email,
                ...newSecondaryContacts.map(contact => contact.email)
            ].filter(Boolean);

            const phoneNumbers = [
                primaryContact.phoneNumber,
                ...newSecondaryContacts.map(contact => contact.phoneNumber)
            ].filter(Boolean);

            const secondaryContactIds = newSecondaryContacts.map(contact => contact.id);

            res.status(200).json({
                contact: {
                    primaryContactId: primaryContact.id,
                    emails: [...new Set(emails)], 
                    phoneNumbers: [...new Set(phoneNumbers)],
                    secondaryContactIds
                }
            });
            return;
        } catch (error) {
            console.error('Error in identify process:', error);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }
  }
}

export default Identify;
