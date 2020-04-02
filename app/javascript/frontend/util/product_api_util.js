import $ from "jquery";

export const getAllProducts = () => (
    $.ajax({
        method: 'GET',
        url: `/api/products`,
        error: (err) => console.log(err)
    })
);



export const getProductsByDept= (deptNo) => (
    $.ajax({
        method: 'GET',
        url: `/api/products/department?department_id=${deptNo}`,
        error: (err) => console.log(err)
    })
);


export const createProduct = product => (
    $.ajax({
      method: 'POST',
      url: '/api/products/new',
      data: { product }
    })
);