import React from 'react';
import {connect} from 'react-redux';
import { getProductsByDeptThunk } from '../../actions/product_actions';
import NavBar from '../navbar/navbar';
import * as OrderActions from '../../actions/order_actions';
import * as LineActions from '../../actions/order_line_actions';
import { updateOrder } from '../../util/order_api_util';

class ProductListDept extends React.Component {
   
   constructor(props){
      super(props);
      this.state = {
         products: [],
         order: {
            order_total: 1500,
         },
         orderLine : {
            quantity: 1
         }
      }
      this.handleCreateOrder = this.handleCreateOrder.bind(this);
      this.handleUpdateOrder = this.handleUpdateOrder.bind(this);
   }
   
   componentDidMount(){
      const { getProductsByDept } = this.props;
      getProductsByDept(10) //config constant
      .then(() => this.setState({products: Object.values(this.props.productsByDept)}));
   }

   getMatchingLine( orderLines, productId ) {
      let orderLinesArray = Object.values(orderLines);
      // debugger;
      for (let index = 0; index < orderLinesArray.length; index++) {
         let orderLine = orderLinesArray[index];
         if (orderLine.product_id === productId) return orderLine;
      }
      return false;
   }

   handleCreateOrder(productId, productUnit, productPrice) {
      const { createOrder, createOrderLine, getOrderLinesByOrder } = this.props;

      createOrder(this.state.order)
      .then((order) => {
         const orderLineInfo = {
            product_id: productId,
            order_id: order.data.id,
            quantity: 1,
            line_total: 1000,
            unit: productUnit
         };
         console.log('order created successfully from handle create', order);
         createOrderLine(orderLineInfo)
         .then((line) => {
            console.log('newly line created', line);
            getOrderLinesByOrder(line.data.order_id);
         })
      }
      )
   }


   handleUpdateOrder(productId, productUnit, orderId, productQuantity, productPrice) {

      const { currentOrderLines, createOrderLine, currentOrder, 
         getOrderLinesByOrder, updateOrderLine } = this.props;

      let matchingLine = this.getMatchingLine(currentOrderLines, productId);
      if (matchingLine) {
         let newQuantity = productQuantity + matchingLine.quantity;
         let newLineTotal = (productQuantity * productPrice) + matchingLine.line_total;
         // let lineId = matchingLine.id;
         const orderLineInfo = {
            product_id: productId,
            order_id: orderId,
            quantity: newQuantity,
            line_total: newLineTotal,
         };
         updateOrderLine(orderLineInfo)
         .then(() => getOrderLinesByOrder(currentOrder.id));
      } else {
         const orderLineInfo = {
            product_id: productId,
            order_id: orderId,
            quantity: 1,
            line_total: 1000,
            unit: productUnit
         };
         createOrderLine(orderLineInfo)
         .then(() => getOrderLinesByOrder(currentOrder.id))
         .then(() => console.log('order updated and orderLine added to order successfully'))
      }
   }

   handleAddToOrder(productId, productUnit, productPrice, productQuantity) {
      const { currentOrder } = this.props;
      if (currentOrder && currentOrder.id) {
         this.handleUpdateOrder(productId, productUnit,  currentOrder.id, productQuantity);
      } else {
         this.handleCreateOrder(productId, productUnit);
      }
   }
   
   decreaseLineQuantity(productId, productPrice) {
      const { currentOrderLines, updateOrderLine, getOrderLinesByOrder } = this.props;
      let matchingLine = this.getMatchingLine(currentOrderLines, productId);
      if (matchingLine) {
         let newQuantity =  matchingLine.quantity - 0.5;
         let newLineTotal = matchingLine.line_total - 500;
         // let lineId = matchingLine.id;
         const orderLineInfo = {
            product_id: productId,
            order_id: matchingLine.order_id,
            quantity: newQuantity,
            line_total: newLineTotal,
         };
         updateOrderLine(orderLineInfo)
         .then(() => getOrderLinesByOrder( matchingLine.order_id,));
      }
   }

   render() {
      const products = this.state.products;
      window.fruitsState = this.state;
      const { currentOrderLines } = this.props;
      let key = 0;

      String.prototype.capitalize = function() {
         return this.charAt(0).toUpperCase() + this.slice(1)
      };

      return(<div className="product-show">
               <NavBar 
                  title = 'Fruits'
               />
               <div className="product-list-wrapper">
                  {products.map(product => (
                     <div className="product-item-wrapper" key={key++}>
                        <img className="product-image" 
                              src="https://onestorebucket.s3.eu-west-3.amazonaws.com/tomato.jpg"
                        />
                        <div className="product-details">
                           <span className="product-title">
                              {product.name.capitalize()}
                           </span>
                        </div>

                        { (currentOrderLines && this.getMatchingLine(currentOrderLines, product.id) && this.getMatchingLine(currentOrderLines, product.id).quantity > 0) && <button
                           className="decrease-quantity-button"
                           onClick = {() => this.decreaseLineQuantity(product.id)}
                        > - </button> }
                        <button 
                        onClick = { () => this.handleAddToOrder(product.id, product.unit, null, 0.5)}
                        className="add-button">
                           { (currentOrderLines && this.getMatchingLine(currentOrderLines, product.id) && this.getMatchingLine(currentOrderLines, product.id).quantity > 0) 
                              ?
                              <span> { this.getMatchingLine(currentOrderLines, product.id).quantity }
                                 <span 
                                 className = "plus-sign"
                                 > + </span>
                              </span>
                              :
                             <span> Add to list </span>}
                        </button>
                     </div>
                  ))}              
               </div>
         </div>
      )
   }
}



const mapStateToProps = state => ({
   productsByDept: state.products.productsByDept,
   currentOrder: state.orders.currentOrder,
   currentOrderLines: state.orders.currentOrderLines
 });
 
 const mapDispatchToProps = dispatch => ({
   getProductsByDept: (no) => dispatch(getProductsByDeptThunk(no)),
   createOrder: (orderInfo) => dispatch(OrderActions.createOrderReduxAjax(orderInfo)),
   createOrderLine: (orderLineInfo) => dispatch(LineActions.createOrderLineReduxAjax(orderLineInfo)),
   updateOrderLine: (orderLineInfo) => dispatch(LineActions.updateOrderLineReduxAjax(orderLineInfo)),
   getOrderLinesByOrder: (orderId) => dispatch(LineActions.getOrderLinesByOrderReduxAjax(orderId))
});
 
 
export default connect(mapStateToProps, mapDispatchToProps)(ProductListDept);



