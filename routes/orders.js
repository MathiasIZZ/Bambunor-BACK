var express = require('express');
var router = express.Router();

const { database }  = require('../config/helpers');



/* GET all orders */
router.get('/', function(req, res) {

    database.table('orders_details as od')
        .join([
            {
                table: 'orders as o',
                on: 'o.id = od.order_id'
            },
            {
                table: 'products as p',
                on: 'p.id = od.product_id'
            },
            {
                table: 'users as u',
                on: 'u.id = o.user_id'
            }
        ])
        .withFields(['o.id', 'p.title as name', 'p.description', 'p.price', 'u.username'])
        .sort({id: .1})
        .getAll()
        .then( orders => {
            if( orders.length > 0) {
                res.status(200).json(orders);
            }
            else {
                res.json( { message: "Aucun panier trouvé" });
            }
        })
        .catch(err => console.log(err));

});

// GET ORDER EN QUESTION

router.get('/:id', (req, res)  => {

    let ordersId = req.params.id;

    database.table('orders_details as od')
        .join([
            {
                table: 'orders as o',
                on: 'o.id = od.order_id'
            },
            {
                table: 'products as p',
                on: 'p.id = od.product_id'
            },
            {
                table: 'users as u',
                on: 'u.id = o.user_id'
            }
        ])
        .withFields(['o.id', 'p.title as name', 'p.description', 'p.price', 'u.username'])
        .filter({'o.id': ordersId})
        .getAll()
        .then( orders => {
            if( orders.length > 0) {
                res.status(200).json(orders);
            }
            else {
                res.json( { message: `Aucun panier trouvé with orderId ${ ordersId }` });
            }
        })
        .catch(err => console.log(err));

});

/* PLACER UNE NOUVELLE COMMANDE  */

router.post('/new', async (req, res,) => {
    //let userId = req.body.userId;
    //let data = JSON.parse(req.body);


    let {userId, products} = req.body;


    if (userId !== null && userId > 0) {
        database.table('orders')
            .insert({
                user_id: userId
            }).then((newOrderId) => {

            if (newOrderId > 0) {
                products.forEach(async (p) => {

                    let data = await database.table('products').filter({id: p.id}).withFields(['quantity']).get();



                    let inCart = parseInt(p.incart);

                    // Deduct the number of pieces ordered from the quantity in database

                    if (data.quantity > 0) {
                        data.quantity = data.quantity - inCart;

                        if (data.quantity < 0) {
                            data.quantity = 0;
                        }

                    } else {
                        data.quantity = 0;
                    }

                    // Insert order details w.r.t the newly created order Id
                    database.table('orders_details')
                        .insert({
                            order_id: newOrderId,
                            product_id: p.id,
                            quantity: inCart
                        }).then(newId => {
                        database.table('products')
                            .filter({id: p.id})
                            .update({
                                quantity: data.quantity
                            }).then(successNum => {
                        }).catch(err => console.log(err));
                    }).catch(err => console.log(err));
                });

            } else {
                res.json({message: 'New order failed while adding order details', success: false});
            }
            res.json({
                message: `Order successfully placed with order id ${newOrderId}`,
                success: true,
                order_id: newOrderId,
                products: products
            })
        }).catch(err => res.json(err));
    }

    else {
        res.json({message: 'New order failed', success: false});
    }

});


// FAKE PAIEMENT GATEWAY CALL

router.post('/payment', (req, res) => {
    setTimeout( () => {
        res.status(200).json({
            success: true
        })
    })
})









/*
// ROUTE EN ES6
router.get('/:id', (req, res)  => {

});

// ROUTE EN JAVASCRIPT VANILLA
router.get('/:id',  function (req, res){

})
*/


module.exports = router;
