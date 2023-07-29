const express = require('express')
const app = express()
const bodyParser = require('body-parser')
require('dotenv').config()
const { connect , Schema , model } = require('mongoose')

connectWithDB()

async function connectWithDB() {

    try {
        await connect(process.env.MONGODBALTAS)
        console.log('connected')
    } catch (error) {
        console.log(error)
    }
}

const schema = new Schema({
    name:String,
    itemsCollection:{
        type:Array,
        default:[]
    }
})
const item = model('items',schema)



var navItems = []
app.use(express.static('public'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))

app.set('view engine','ejs')
app.set('views','ejsFiles')

app.get( '/' , async ( req,res )=> {

    let date = new Date ()
    let today = date.getDay()
   
    let options = {
        weekday:"long",
        day:"numeric",
        month:"long"
    }

    let day = date.toLocaleDateString('en-us',options)
    try {
        
        let data = await item.find({})
        let allPages = data.map(x=>x.name)
        let all = data.map(x=>[...x.itemsCollection])
   
        res.render('index',{ day:day,num:5 ,item:[] , title:'ALL' , navItems:allPages})

    } catch (error) {
        console.log(error)
    }


    
})

app.get('/:id',async(req,res)=> {
    
    let date = new Date ()
    let today = date.getDay()
    const {id} = req.params
    let options = {
        weekday:"long",
        day:"numeric",
        month:"long"
    }

       

    let day = date.toLocaleDateString('en-us',options)
    try {
        let data = await item.find({})
        let allPages = data.map(x=>x.name)
        let byReq = await item.find({name:id})
        res.render('index',{ day:day,num:5 , item:byReq , title:id , navItems:allPages})

    } catch (error) {
        console.log(error)
    }
})

app.post('/delete/:id', async ( req,res )=> {
    const {id} = req.params
    const {itemName} = req.body
   
    try {
        
        await item.updateOne({name:id}, {$pull:{itemsCollection:itemName}})        
        res.redirect('/'+id)
    } catch (error) {
        console.log(error)
    }
    
})
app.post( '/', async (req,res)=>{
    const {data , page} = req.body

    try {

        let findOne = await item.find({name:page})
        if( findOne.length==0 ) {
            await item.create({name:page,itemsCollection:[data]})

        }
        else {
            await item.updateOne({name:page},{$push:{itemsCollection:data}})
        }
    } 
    catch (error) {
        console.log(error)        
    }
    

    res.redirect('/'+page)
    
   
} )



app.listen( process.env.PORT, ()=> {

    console.log( 'Server is listing on port 3000' )
})