
const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures');

//Aliasing thisnis only for when most used route is needed .ie user wants five best cheep things
const aliasTopTour=(req, res, next) => {
      req.query.limit = "5"
  //   req.query.sort = "-property,proprty"
        req.query.sort = "-name"
        req.query.fields = "name,price,summary,difficulty"
    next()
}


const getAllTours = async (req, res) => {
  try {
   const features = new APIFeatures(Tour.find(),req.query).filter().sort().limitFields(). pagination()
   const tours = await features.query 
    // const query = Tour.find();
    // const allTours = await query;
    if(allTours.length) {
      return res.status(200).json({
        status: "Success",
        data: tours,
      });
    }else{
      return res.status(400).json({
        status: "Fail",
        message:"Could not find tours",
      });
    }
  }catch(err) {
    return res.status(400).json({
      status: "Fail",
      message:err.message,
    });
  }
  
};

const createTour = async (req, res) => {
  try{
    const newTour = await Tour.create({...req.body});
    if(newTour){
      return res.json({
        status: "Success",
        message: 'Tour created successfully',
        data: newTour
      });
    }else{
      return res.status(400).json({
        status: "Fail",
        message:"Coud not create tour",
      });    }
  }catch(err){
    return res.status(404).json({
      status: "Fail",
      message:err.message,
    });  }
};

const getSingleTour = async (req, res) => {
  try{
    const tour = await Tour.findById(req.params.id);
    if(tour) {
      return res.status(200).json({
        status: "Success",
        data:tour
      });
    }else{
      return res.status(400).json({
        status: "Fail",
        message:"Could not find tour",
      }); 
       }
  }catch(err){
    return res.status(404).json({
      status: "Fail",
      message:err.message,
    }); 
   }
};

const deleteTour = async (req, res) => {
  try{
      const tour = await Tour.findById(req.params.id);
      if(tour) {
        return res.status(204).json({
          status: "Success",
          message:"Tour deleted successfully"
        });
      }else{
        return res.status(400).json({
          status: "Fail",
          message:"Could not find tours",
        });
      }
   }catch(err){
    return res.status(404).json({
      status: "Fail",
      message:err.message,
    });  }
 
};

const editTour = async (req, res) => {
  const result = await res.json({
    status: 200,
    message: 'Hello editTour',
  });
};

//Aggregation
const getTourStats = async (req, res) => {
  try{
    const stats = await Tour.aggregate([

      {
        $match:{ ratingsAverage :{$gte:4.5}}
      },
      {
        $group:{
          // _id:null,
          // _id:'difficulty',
          _id:{$toUpper:"difficulty"},
          numRatings:{$sum:'$ratingQuantity'},
          numTours:{$sum:1},
           avgRating :{$avg:'$ratingsAverage'},
           avgPrice :{$avg:'$price'},
           minPrice:{$min:'$price'},
           maxcPrice:{$max:'$price'}
          },
      },
      {
        $sort:{ avgPrice:1 }
      },
      {
        $match:{_id: {$ne:"EASY"} }
      }
    ]);

    if(stats) {
      return res.status(200).json({
        status: "Success",
        data:stats
      });
    }else{
      return res.status(400).json({
        status: "Fail",
        message:"Could not find stats",
      }); 
       }
  }catch(err){
    return res.status(404).json({
      status: "Fail",
      message:err.message,
    });   

  }
},
const getMonthlyPlan = async (req, res) => {
  try{
    const year = req.params.year * 1;
      const plan = await Tour.aggregate([
        {
          $unwind:'$startDates'
        },
        {
          $match:{
            startDates:{
              $gte: newDate(`${year}-01-01`),
              $lte: newDate(`${year}-12-31`),

            }
          }
        },
        {
          $group:{
            _id:{$month:'$startDates'},
            numTourStarts:{$add:1},
            tour:{$push:'$name'}
          }
        },
        {
          $addFields:{$month:'$_id'}
        },
        {
          $project:{
            _id:0
          }
        },
        {
          $sort:{numTourStarts:-1}
        },
        // {
        //   $limit:6
        // }
      ]);
      if(plan) {
        return res.status(204).json({
          status: "Success",
          data: plan
        });
      }else{
        return res.status(400).json({
          status: "Fail",
          message:"Could not find tours",
        });
      }
   }catch(err){
    return res.status(404).json({
      status: "Fail",
      message:err.message,
    });  }
 
};

module.exports = {
  getAllTours,
  getSingleTour,
  createTour,
  deleteTour,
  editTour,
  aliasTopTour,
  getTourStats,
  getMonthlyPlan
};
