import mongoose from "mongoose";
import { Router } from "express";
import bcrypt from "bcrypt";
import checkToken from "../../middleware/checkToken.js";
import checkRequiredFields from "../../middleware/checkRequiredFields.js";
import CityAndCountry from "../../models/CityCountryModel/CityAndCountry.js";
import logoMiddleware from "../../middleware/logoMiddleware.js";
import configureCloudinary from "../../services/Cloudinary/cloudinary_config.js";
import { validationResult } from "express-validator";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import signInFromJwt from "../../controllers/AuthController.js";
import uploadLogoToCloudinary from "../../services/Cloudinary/uploadLogoToCloudinary.js";
dotenv.config();
configureCloudinary();
const router = Router();

// Login route
router.post("/login", async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Check if the email is provided
    if (!email) {
      return res.status(401).json({ error: "Please provide a valid email!" });
    }

    // Check if password is provided
    if (!password) {
      return res.status(422).json({ error: "Password is required!" });
    }

    // Find company by email and exclude password field
    const company = await Company.findOne({ email });

    if (!company) {
      return res
        .status(404)
        .json({ error: "No company found with this email!" });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(
      password,
      company.password
    );

    if (!isPasswordValid) {
      return res.status(422).json({ error: "Incorrect password" });
    }

    // Generate token to login the user
    const token = signInFromJwt(company._id);
    // Return company details along with token
    return res.status(200).json({ id: company._id, token: token });
  } catch (error) {
    console.error(`Error logging in: ${error}`);
    res.status(500).json({ error: "Error logging in" });
  }
});


router.post(
  "/signup-company",
  checkRequiredFields([
    "companyName",
    "email",
    "password",
    "phone",
    "companyType",
    "cityName",
    "postalCode",
    "streetName",
    "number",
  ]),
  async (req, res) => {
    try {
      const companyBodyData = await req.body;

      // Check if the email of the Company is already in use
      const emailExists = await Company.findOne({
        email: companyBodyData.email,
      });
      if (emailExists) {
        return res.status(422).json({ error: "Email already in use." });
      }

      // Check if the phone of the Company is already in use
      const phoneExists = await Company.findOne({
        phone: companyBodyData.phone,
      });
      if (phoneExists) {
        return res.status(422).json({ error: "Phone already in use." });
      }

      // Create an instance of Company with the provided data
      const company = new Company({
        companyName: companyBodyData.companyName,
        email: companyBodyData.email,
        password: companyBodyData.password,
        phone: companyBodyData.phone,
        companyType: companyBodyData.companyType,
        cityName: companyBodyData.cityName,
        postalCode: companyBodyData.postalCode,
        streetName: companyBodyData.streetName,
        number: companyBodyData.number,
      });

      // Save the company to the database
      const newCompany = await company.save();

      // Create the corresponding details automatically
      let details;
      switch (newCompany.companyType) {
        case "promoter":
          details = await PromoterDetails.create({
            company: newCompany._id,
          });
          break;
        case "bar":
          details = await BarDetails.create({
            company: newCompany._id,
          });
          break;
        case "club":
          details = await ClubDetails.create({
            company: newCompany._id,
          });
          break;

        default:
          // If the company type is invalid
          return res.status(400).json({ error: "Invalid company type." });
      }

      // Associate the created details with the company
      newCompany.details = details._id;
      await newCompany.save();
      const createdCompany = await Company.findById(
        newCompany._id
      )
        .select("-password")
        .select("-__v")
        .populate("details");
      // Respond with the created company
      console.log("Company created successfully:", createdCompany); // Add this log
      // Generate token to login the user
      const token = signInFromJwt(newCompany._id);
      return res
        .status(201)
        .json({ company: createdCompany, token });
    } catch (error) {
      // If an error occurs during the process
      console.error("Error creating Company: ", error);
      return res.status(500).json({
        error: "Error creating company, please try again later!",
      });
    }
  }
);


/// -- Router fetch-company-type where u can filter from Comapany type and get pagination
router.get("/fetch-company-type", async (req, res) => {
  try {
    const { cityName, companyType, page = 1, limit = 10 } = req.query;
    let query = {}; // Start the query as empty query

    // Se o parâmetro companyType estiver presente na solicitação, adicione-o à consulta
    if (companyType) {
      query.companyType = companyType;
    }
    // Se o parâmetro companyType estiver presente na solicitação, adicione-o à consulta
    if (cityName) {
      query.cityName = cityName;
    }

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    };

    // Execute a consulta
    const companys = await Company.paginate(query, options, {
      sort: { createdAt: 1 },
    });

    if (companys.docs.length === 0) {
      return res
        .status(404)
        .send("Companys not found for the specified company type");
    }

    // Mapeie os companyelecimentos para remover o campo 'password'
    const sanitizedCompanys = companys.docs.map((company) => {
      const { password, ...rest } = company.toObject();
      return rest;
    });

    return res.status(200).json({
      companys: sanitizedCompanys,
      total: companys.totalDocs,
      totalPages: companys.totalPages,
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Rota para buscar um companyelecimento específico e popular os detalhes
router.get("/get-company-by-user-id/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar o companyelecimento pelo ID e popular os detalhes
    const company = await Company.findById(id)
      .populate("details")
      .select("-password -isEmailVerified");

    if (!company) {
      return res.status(404).json({ error: "Company not found." });
    }

    res.status(200).json({ company });
  } catch (error) {
    console.error("Erro ao buscar companyelecimento:", error);
    res.status(500).json({ error: "server internal Error." });
  }
});

//fetch-all-company
router.get("/fetch-all-company", async (req, res) => {
  try {
    const companys = await Company.find({}).sort({ createdAt: 1 });

    if (companys.length === 0) {
      return res.status(404).json({ error: "Company not found" });
    }

    return res.status(200).json(companys);
  } catch (error) {
    res.status(500).json(error.message);
  }
});

// Exemplo de endpoint GET
router.get("/get-details/:companysId", async (req, res) => {
  try {
    const companysId = req.params.companysId;

    // Encontrar o tipo de companyelecimento
    const company = await Company.findById(companysId);
    if (!company) {
      return res.status(404).json({ error: "Company not found." });
    }

    const typeCompany = company.companyType;

    // Recuperar dados com base no tipo de companyelecimento
    let companyDetails;
    switch (typeCompany) {
      case "promoter":
        companyDetails = await PromoterDetails.findOne({
          companyId: companysId,
        });
      case "bar":
        companyDetails = await BarDetails.findOne({
          companyId: companysId,
        });
        break;
      case "club":
        companyDetails = await ClubDetails.findOne({
          companyId: companysId,
        });
        break;
      case "kiosk":
        companyDetails = await KioskDetails.findOne({
          companyId: companysId,
        });
        break;
      default:
        return res.status(400).json({ message: "Invalid company type." });
    }

    // Retorna os dados combinados
    const combinedData = {
      _id: company._id,
      companyName: company.companyName,
      email: company.email,
      phone: company.phone,
      companyType: company.companyType,
      ///
      companyDetails,
    };

    // Retorna os dados combinados
    return res.status(200).json({ combinedData });
  } catch (error) {
    console.error("Error when fetching company data:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

router.get("/fetchCompanyByCity/:cityName", async (req, res) => {
  try {
    const cityName = req.params.cityName;

    const companys = await Company.find({
      cityName: cityName,
    }).select("-isFeatured");

    if (companys.length === 0) {
      return res
        .status(404)
        .json({ msg: "No companys found for this city" });
    }

    res.status(200).json(companys);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/fetchEventIsFeatured/:isFeatured", async (req, res) => {
  try {
    const isFeatured = req.params.isFeatured;

    const companys = await Company.find({ isFeatured: isFeatured })
      .select("-isFeatured")
      .populate("cityId");
    console.log(companys);

    if (events.length === 0) {
      return res
        .status(404)
        .json({ error: `No Featured companys so far` });
    }

    res.status(200).json(companys);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get(
  "/fetchCompanyByOrganizedBy/:organizedBy",
  async (req, res) => {
    try {
      const organizedBy = req.params.organizedBy;

      const companys = await Company.find({
        organizedBy: organizedBy,
      })
        .select("-isFeatured")
        .populate("cityId");

      if (companys.length === 0) {
        return res.status(404).json({
          error: `${organizedBy} has not organized any companys so far`,
        });
      }

      res.status(200).json(companys);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

router.get(
  "/fetchCompanysByDateRange/:startDate/:endDate",
  async (req, res) => {
    try {
      const startDate = req.params.startDate;
      const endDate = req.params.endDate;

      const companys = await Company.find({
        start_date: { $gte: startDate },
        end_date: { $lte: endDate },
      }).select("-isFeatured");

      if (companys.length === 0) {
        return res
          .status(404)
          .json({ msg: "No companys found within the date range" })
          .populate("cityId");
      }

      res.status(200).json(companys);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

/// logo update router
router.put(
  "/update/logo/:companyId",
  logoMiddleware.single("logo"),
  async (req, res, next) => {
    const companyId = req.params.companyId;
    // Verifica se há um arquivo na requisição
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const company = await Company.findById(companyId);

    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }

    // Get the ID of the company details
    const companyDetailsId = company.details;

    // Find the Details document by ID
    const details = await Details.findOne({ _id: companyDetailsId });

    if (!details) {
      return res.status(404).json({ error: "Details not found" });
    }

    // Save the current logoUrl before update
    const logoUrlBeforeUpdate = details.logoUrl;

    // Upload image to Cloudinary
    const secure_url = await uploadLogoToCloudinary(
      req.file.path,
      companyId,
      company.companyName
    );

    if (!secure_url) {
      console.error("Error uploading image:", error);
      return res.status(500).json({ error: "Error uploading image" });
    }

    // Update logoUrl with the new secure_url
    details.logoUrl = secure_url;
console.log(details.logoUrl)
    // Save the changes
    const updated = await Details.findOneAndUpdate(details._id, details, {
      new: true,
    });
    console.log(updated)
    // Save the updated logoUrl after update
    const logoUrlAfterUpdate = details.logoUrl;
    // Check if logoUrl was changed
    const logoUrlChanged = logoUrlBeforeUpdate !== logoUrlAfterUpdate;

    // Send response
    res.status(200).json({ status: "success", logoUrlChanged });
  }
);

// PATCH route to update company details
router.put("/update/:companyId/details", async (req, res) => {
  try {
    const companyId = req.params.companyId;

    // Find the Company document by ID
    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }

    // Get the ID of the company details
    const companyDetailsId = company.details;

    // Find the Details document by ID
    const details = await Details.findById(companyDetailsId);

    if (!details) {
      return res.status(404).json({ error: "Details not found" });
    }

    if (companyDetailsId.toString() !== details._id.toString()) {
      return res.status(404).json({ error: "Details IDs do not match" });
    }

    // Update company details data based on request data
    for (const field in req.body) {
      if (details[field] !== undefined) {
        details[field] = req.body[field];
      }
    }
    // Save the changes
    await details.save();

    res.status(200).json({ details, status: "success" });
  } catch (error) {
    console.error("Error updating company details:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/edit/:companyId", async (req, res) => {
  try {
    const companyData = await req.body;
    const companyId = req.params.companyId;
    // Verificar se o evento existe
    const company = await Company.findById(companyId)
      .select("-isFeatured")
      .populate("cityId");
    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }

    // Verificar se o Promoter tem permissão para editar o evento
    if (company.promoter.toString() !== req.promoter._id) {
      console.log(company.promoter.toString());
      return res.status(403).json({ msg: "Unauthorized access" });
    }
    // Atualizar os dados do evento
    (company.companyName = companyData.companyName),
      (company.email = companyData.email),
      (company.password = companyData.password),
      (company.stateName = companyData.stateName),
      (company.cityName = companyData.cityName),
      (company.postalCode = companyData.postalCode),
      (company.streetName = companyData.streetName),
      (company.number = companyData.number),
      (company.phone = companyData.phone),
      (company.companyType = companyData.companyType),
      (company.updatedAt = Date.now());

    // Salvar as alterações no banco de dados
    const updatedCompany = await companyData.save();

    res.status(200).json(updatedCompany);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/delete/:companyId", checkToken, async (req, res) => {
  try {
    const companyId = req.params.companyId;

    // Check if the company exists
    const company = await Event.findById(companyId).select(
      "-isFeatured"
    );
    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }

    // Verificar se o User tem permissão para editar o company
    if (company.user.toString() !== req.user._id) {
      console.log(company.user.toString());
      return res.status(403).json({ error: "Unauthorized access" });
    }
    // Delete the company
    await Company.deleteOne({ _id: companyId });

    res.status(200).json({ error: "Company deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
