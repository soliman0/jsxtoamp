

// const readline = require('readline').createInterface({
//   input: process.stdin,
//   output: process.stdout
// })

// readline.on('line', (line) => {

// })

// var commander = require('commander');

// commander
//   .command('app <name>')
//   .option('-e --env [type]', '设置环境')
//   .option('-c --config [type]', '设置启动环境包')
//   .action((name, cmd, config) => {
//     
//     var env = cmd.env;
//     var config = cmd.config?cmd.config:'chenyan';
//     if (env) {  
//     } else {
//      
//     }
//   });


  if(process.argv.length==3){
    if(process.argv[2].indexOf('.')==-1){
      process.argv[2] +='.jsx'
    }
    console.log('生成小程序文件')
  }else{
    console.log('输入指令: node ast.js <jsx文件>')
    return
  }



const traverse = require('@babel/traverse').default;
const types = require('@babel/types');

const babelparser = require('@babel/parser');

const generate = require('@babel/generator').default;

const fs = require('fs')

var globalcode;

try{
  globalcode =  fs.readFileSync('./'+process.argv[2],'utf8')
}catch(err){
  if (err.code == 'ENOENT') {
    console.log('没有找到该文件')
  }else{
    console.log('读取文件失败')
  }
  return
}





const ast = babelparser.parse(globalcode, {
  sourceType: 'module',
  plugins: ['jsx','classProperties']
});

var classMethods = ''
var renderNode = ''
var cssbundles = ''
var dataobject = ''
var onloadinfo,onreadyinfo,onunloadinfo





traverse(ast, {


  ClassDeclaration(path){

    path.node.body.body.map((item,outerindex)=>{
      if(item.type=='ClassMethod'){
        if(item.key.name=='componentWillMount'){
          onloadinfo = generate(item.body,{}).code

        }else if(item.key.name=='componentDidMount'){
          onreadyinfo = generate(item.body,{}).code

        }else if(item.key.name=='componentWillUnmount'){
          onunloadinfo = generate(item.body,{}).code

        }else if(item.key.name=='render'){

          item.body.body.map(item=>{
          

            if(item.type=='ReturnStatement'){//jsx area
            
              

           
              let res1 = generate(item.argument,{});

              renderNode = babelparser.parse(res1.code, {
                sourceType: 'module',
                plugins: ['jsx','classProperties']
              });




  
              traverse(renderNode, {
  
                enter(path) {
              
                  if (path.node.type == 'JSXOpeningElement' && (path.node.name.name == 'div' || path.node.name.name == 'span' || path.node.name.name == 'li' || path.node.name.name == 'p')) {
                    path.node.name.name = 'view'
                  }
              
                  if (path.node.type == 'JSXClosingElement' && (path.node.name.name == 'div' || path.node.name.name == 'span' || path.node.name.name == 'li' || path.node.name.name == 'p')) {
                    path.node.name.name = 'view'
                  }
              
                  if (path.node.type == 'JSXOpeningElement' && path.node.name.name == 'img') {
                    path.node.name.name = 'image'
                    path.node.attributes.some((item,index)=>{
                      if(item.name.name=='src'&&types.isJSXExpressionContainer(item.value)){
                        path.node.attributes[index].value = types.stringLiteral('{'+generate(item.value, {}).code+'}')
                        return 1
                      }
                    })
                  }
              
                  if (path.node.type == 'JSXClosingElement' && path.node.name.name == 'img') {
                    path.node.name.name = 'image'
                  }

                  if (path.node.type == 'JSXAttribute' && path.node.name.name == 'style') {
                    if(types.isObjectExpression(path.node.value.expression)){
                      let properties = path.node.value.expression.properties
                      let finalstr = ''
                      properties.map(property => {
                        let propertyvalue = ''
                        if(types.isStringLiteral(property.value)||types.isNumericLiteral(property.value)){
                          propertyvalue += property.value.value
                          
                        }else if(types.isCallExpression(property.value)){
                          let resstr = generate(property.value,{});
                          
                          propertyvalue += resstr.code
                          
                        }else if(types.isTemplateLiteral(property.value)){
                          let resstr = generate(property.value,{});
                        
                          propertyvalue += resstr.code
                        
                        }

                        finalstr += property.key.name.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`) + ':' +propertyvalue + ';'
  
                      })
                      path.node.value = types.stringLiteral(finalstr)
                    }
                    if(types.isConditionalExpression(path.node.value.expression)){
                      if(types.isBinaryExpression(path.node.value.expression.test)){
                        let consequentnow = path.node.value.expression.consequent
                        let alternatenow = path.node.value.expression.alternate
                        function attributesreplace(properties){
                          let finalstr = ''
                          properties.map(property=>{
                            let propertyvalue = ''
                            if(types.isStringLiteral(property.value)||types.isNumericLiteral(property.value)){
                              propertyvalue += property.value.value
                              
                            }else if(types.isCallExpression(property.value)){
                              let resstr = generate(property.value,{});
                              
                              propertyvalue += resstr.code
                              
                            }else if(types.isTemplateLiteral(property.value)){
                              let resstr = generate(property.value,{});
                            
                              propertyvalue += resstr.code
                            
                            }
    
                            finalstr += property.key.name.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`) + ':' +propertyvalue + ';'
                            
                          })

                          return finalstr

                        }
                        path.node.value.expression.consequent = types.stringLiteral(attributesreplace(consequentnow.properties))
                        path.node.value.expression.alternate = types.stringLiteral(attributesreplace(alternatenow.properties))
                      
                      }
                      // console.log(path.node.value.expression)
                      // path.node.value = generate(property.value,{}).code
                      path.node.value.expression = types.objectExpression([types.objectProperty(types.stringLiteral('data202004081833'), path.node.value.expression)])
                      
                    }

                    
                    
                  }
                  if (path.node.type == 'JSXAttribute' && path.node.name.name == 'className') {
                    path.node.name.name = 'class'
                    if(types.isJSXExpressionContainer(path.node.value)){
                      let newvalue = '{'+generate(path.node.value, {}).code+'}'
                      path.node.value = types.stringLiteral(newvalue)
                    }
                  }

                  if (path.node.type == 'JSXAttribute' && path.node.name.name == 'key') {
                    let newvalue = '{'+generate(path.node.value, {}).code+'}'
                    path.node.value = types.stringLiteral(newvalue)
                  }

                  if (path.node.type == 'JSXAttribute' && path.node.name.name == 'onClick') {
                    path.node.name.name = 'onTap'
                    if(types.isCallExpression(path.node.value.expression)){
                      let functionname = path.node.value.expression.callee.object.property.name
                      path.node.value = types.stringLiteral(functionname)
                    }else if(types.isMemberExpression(path.node.value.expression)){
                      let functionname = path.node.value.expression.property.name
                      path.node.value = types.stringLiteral(functionname)
                    }else{
                      path.node.value = types.stringLiteral('')
                    }
                    
                  }

                  if (path.node.type == 'JSXElement') {

                    if (path.node.openingElement.name.name == 'style') {//处理jsx return 中的 <style></style>
                      path.node.children.some((item) => {
                        if(types.isJSXExpressionContainer(item)&&types.isTemplateLiteral(item.expression)){
                          let res = generate(item.expression,{});
                          cssbundles = res.code.replace(/`/g,'')
                          path.remove()
                          return 1
                          
                         
                        }
                      })
                    }else{
                      path.node.children.map((item,index) => {

                        if(types.isJSXExpressionContainer(item)&&types.isLogicalExpression(item.expression)){
                          let aifexpressionjoint = generate(item.expression.left, {}).code + item.expression.operator
                        
                          if(types.isJSXElement(item.expression.right)){
                            let aifexpression = item.expression.left
                            let jsxelementnow = item.expression.right
                
                            let res = generate(aifexpression, {});
                
                            jsxelementnow.openingElement.attributes.push(types.JSXAttribute(types.JSXIdentifier('aif202004091004'),types.stringLiteral('{{'+res.code+'}}')))
                
                            path.node.children[index] = jsxelementnow
                
                          }else if(types.isCallExpression(item.expression.right)){
                            let item1 = item.expression.right
                            let calleenow = generate(item1.callee, {}).code
                
                            let forvalue = calleenow.split('.').reverse().slice(1)
                            
                            if(~forvalue.indexOf('state')){
                              forvalue.splice(-2)
                              forvalue = forvalue.join('.')
  
                            }else{
                              forvalue = forvalue.reverse().join('.')
                            }
                            let children1 = []
                            
                            item1.arguments.map((aitem)=>{
                              if(types.isArrowFunctionExpression(aitem)||types.isFunctionExpression(aitem)){
                                function recursive1(alternate1){
                                  if(alternate1.type=='IfStatement'&&types.isBinaryExpression(alternate1.test)){
                                    let aif = generate(alternate1.test, {}).code
                                    let viewitem = alternate1.consequent.body[0].argument
                                    viewitem.openingElement.attributes.push(types.jsxAttribute(types.JSXIdentifier('aif202004091004'),types.stringLiteral('{{'+unescape(aif)+'}}')))
                                    children1.push(viewitem)
                                    if(alternate1.alternate){
                                      recursive1(alternate1.alternate)
                                    }
                                  }
                                  if(alternate1.type=='BlockStatement'){
                                    let viewitem1 = alternate1.body[0].argument
                                    viewitem1.openingElement.attributes.push(types.jsxAttribute(types.JSXIdentifier('aelse202004131624'),types.stringLiteral('')))
                                    children1.push(viewitem1)
                                  }
                                  if(alternate1.type=='ReturnStatement'){
                                    let viewitem1 = alternate1.argument
                                    // viewitem1.openingElement.attributes.push(types.jsxAttribute(types.JSXIdentifier('aelse202004131624'),types.stringLiteral('')))
                                    children1.push(viewitem1)
                                  }
                                }
                                aitem.body.body.map(bitem=>{
                                  
                                  recursive1(bitem)
                                  
                                })
                              
                              }
                            })
                          
                            let forview = types.jsxElement(types.jsxOpeningElement(types.jsxIdentifier('view'),[types.jsxAttribute(types.JSXIdentifier('afor202004131551'),types.stringLiteral('{{'+forvalue+'}}'))]),types.jsxClosingElement(types.jsxIdentifier('view')),children1)
                            path.node.children[index] = forview
                          }else if(types.isLogicalExpression(item.expression.right)){
                            //又是个递归..递归中还有递归..
                           
                            function recursive2(expresssion2){
                              let aifexpression = expresssion2.left
                              let res = generate(aifexpression, {});

                              aifexpressionjoint+=(res.code + expresssion2.operator)

                              if(types.isJSXElement(expresssion2.right)){
                                
                                let jsxelementnow = expresssion2.right
                    
                               
                    
                                jsxelementnow.openingElement.attributes.push(types.JSXAttribute(types.JSXIdentifier('aif202004091004'),types.stringLiteral('{{'+aifexpressionjoint+'}}')))
                    
                                path.node.children[index] = jsxelementnow
                    
                              }else if(types.isCallExpression(expresssion2.right)){
                                let item1 = expresssion2.right
                                let calleenow = generate(item1.callee, {}).code
                    
                                let forvalue = calleenow.split('.').reverse().slice(1)
                                
                                if(~forvalue.indexOf('state')){
                                  forvalue.splice(-2)
                                  forvalue = forvalue.join('.')
      
                                }else{
                                  forvalue = forvalue.reverse().join('.')
                                }
                                let children1 = []
                                
                                item1.arguments.map((aitem)=>{
                                  if(types.isArrowFunctionExpression(aitem)||types.isFunctionExpression(aitem)){
                                    function recursive1(alternate1){
                                      if(alternate1.type=='IfStatement'&&types.isBinaryExpression(alternate1.test)){
                                        let aif = generate(alternate1.test, {}).code
                                        let viewitem = alternate1.consequent.body[0].argument
                                        viewitem.openingElement.attributes.push(types.jsxAttribute(types.JSXIdentifier('aif202004091004'),types.stringLiteral('{{'+unescape(aif)+'}}')))
                                        children1.push(viewitem)
                                        if(alternate1.alternate){
                                          recursive1(alternate1.alternate)
                                        }
                                      }
                                      if(alternate1.type=='BlockStatement'){
                                        let viewitem1 = alternate1.body[0].argument
                                        viewitem1.openingElement.attributes.push(types.jsxAttribute(types.JSXIdentifier('aelse202004131624'),types.stringLiteral('')))
                                        children1.push(viewitem1)
                                      }
                                      if(alternate1.type=='ReturnStatement'){
                                        let viewitem1 = alternate1.argument
                                        // viewitem1.openingElement.attributes.push(types.jsxAttribute(types.JSXIdentifier('aelse202004131624'),types.stringLiteral('')))
                                        children1.push(viewitem1)
                                      }
                                    }
                                    aitem.body.body.map(bitem=>{
                                      
                                      recursive1(bitem)
                                      
                                    })
                                  
                                  }
                                })
                              
                                let forview = types.jsxElement(types.jsxOpeningElement(types.jsxIdentifier('view'),[types.jsxAttribute(types.JSXIdentifier('afor202004131551'),types.stringLiteral('{{'+forvalue+'}}'))]),types.jsxClosingElement(types.jsxIdentifier('view')),children1)
                                path.node.children[index] = forview
                              }else if(types.isLogicalExpression(expresssion2.right)){
                                recursive2(expresssion2.right)
                              }
                              else{
                                let jsxecexpression = expresssion2
                                let oe = types.objectProperty(types.stringLiteral('data202004081833'), jsxecexpression)
                                expresssion2 = types.objectExpression([oe])
                              }
                            }

                            recursive2(item.expression.right)


                          }else{
                            let jsxecexpression = item.expression
                            let oe = types.objectProperty(types.stringLiteral('data202004081833'), jsxecexpression)
                            item.expression = types.objectExpression([oe])
                          }
                
                        }else if (types.isJSXExpressionContainer(item)&&types.isMemberExpression(item.expression)){
                          let jsxecexpression = item.expression
                          let oe = types.objectProperty(types.stringLiteral('data202004081833'), jsxecexpression)
                          item.expression = types.objectExpression([oe])
                
                        }else if(types.isJSXExpressionContainer(item)&&types.isConditionalExpression(item.expression)){
                          let jsxecexpression = item.expression
                          let oe = types.objectProperty(types.stringLiteral('data202004081833'), jsxecexpression)
                          item.expression = types.objectExpression([oe])
                        }else if(types.isJSXExpressionContainer(item)&&types.isCallExpression(item.expression)){//for循环jsx处理
                          //samelogic
                          let calleenow = generate(item.expression.callee, {}).code
                          
                          let forvalue = calleenow.split('.').reverse().slice(1)
                          
                          if(~forvalue.indexOf('state')){
                            forvalue.splice(-2)
                            forvalue = forvalue.join('.')

                          }else{
                            forvalue = forvalue.reverse().join('.')
                          }
                          let children1 = []
                          
                          item.expression.arguments.map((aitem)=>{
                            if(types.isArrowFunctionExpression(aitem)||types.isFunctionExpression(aitem)){
                              function recursive1(alternate1){
                                if(alternate1.type=='IfStatement'&&types.isBinaryExpression(alternate1.test)){
                                  let aif = generate(alternate1.test, {}).code
                                  let viewitem = alternate1.consequent.body[0].argument
                                  viewitem.openingElement.attributes.push(types.jsxAttribute(types.JSXIdentifier('aif202004091004'),types.stringLiteral('{{'+unescape(aif)+'}}')))
                                  children1.push(viewitem)
                                  if(alternate1.alternate){
                                    recursive1(alternate1.alternate)
                                  }
                                }
                                if(alternate1.type=='BlockStatement'){
                                  let viewitem1 = alternate1.body[0].argument
                                  viewitem1.openingElement.attributes.push(types.jsxAttribute(types.JSXIdentifier('aelse202004131624'),types.stringLiteral('')))
                                  children1.push(viewitem1)
                                }
                                if(alternate1.type=='ReturnStatement'){
                                  let viewitem1 = alternate1.argument
                                  // viewitem1.openingElement.attributes.push(types.jsxAttribute(types.JSXIdentifier('aelse202004131624'),types.stringLiteral('')))
                                  children1.push(viewitem1)
                                }
                              }
                              aitem.body.body.map(bitem=>{
                               
                                // if(bitem.type=='IfStatement'&&types.isBinaryExpression(bitem.test)){
                                //   let aif = generate(bitem.test, {}).code
                                //   let viewitem = bitem.consequent.body[0].argument
                                //   viewitem.openingElement.attributes.push(types.jsxAttribute(types.JSXIdentifier('aif202004091004'),types.stringLiteral('{{'+unescape(aif)+'}}')))
                                //   children1.push(viewitem)
                                //   if(bitem.alternate){

                                //   }
                                // }
                                recursive1(bitem)
                                
                              })
                             
                            }
                          })
                          
                          let forview = types.jsxElement(types.jsxOpeningElement(types.jsxIdentifier('view'),[types.jsxAttribute(types.JSXIdentifier('afor202004131551'),types.stringLiteral('{{'+forvalue+'}}'))]),types.jsxClosingElement(types.jsxIdentifier('view')),children1)
                          path.node.children[index] = forview
                        }else if(types.isJSXExpressionContainer(item)&&types.isJSXElement(item.expression)){
                          path.node.children[index] = item.expression
                        }
                
                      })

                    }      
                          
                  }
              
              
                 
                },
                JSXEmptyExpression(path){
                
                  path.parentPath.remove()
                }
            })
          }

          })

        

        }else{//自定义方法
         
          let res = generate(item, {comments:false});
          classMethods+= `${res.code},\r`
         
        }
        

      }else if(item.type=='ClassProperty'){
        if(types.isObjectExpression(item.value)){
          let res = generate(item.value, {comments:false});
          dataobject+=res.code
        }else if(types.isArrowFunctionExpression(item.value)){
          let cmethod = types.classMethod('method',item.key, item.value.params, item.value.body, false, null)
          let res = generate(cmethod, {comments:false});
          classMethods+= res.code+',\r'

        }
      }
    })
  }


})


let xcxjstemplate = `
Page({
  data: ${dataobject||JSON.stringify({})},
  onLoad()${onloadinfo||JSON.stringify({})},
  onReady()${onreadyinfo||JSON.stringify({})},
  
  onShow(){
      
  },
  onUnload()${onunloadinfo||JSON.stringify({})},

  ${
    classMethods 
  }

});
`




let res = generate(renderNode,{});
let cleansedaxml = res.code.replace(/this\.state\./g, '').replace(/"data202004081833":/g, '').replace(/aif202004091004/g,'a:if').replace(/afor202004131551/g,'a:for').replace(/aelse202004131624=""/g,'a:else')

fs.writeFile('./'+process.argv[2].split('.')[0]+'.axml', cleansedaxml,err=>{
  if(err) return console.error(err);
  console.log(process.argv[2].split('.')[0]+'.axml')

})
fs.writeFile('./'+process.argv[2].split('.')[0]+'.acss', cssbundles,err=>{
  if(err) return console.error(err);
  console.log(process.argv[2].split('.')[0]+'.acss')
})
fs.writeFile('./'+process.argv[2].split('.')[0]+'.js', xcxjstemplate.replace(/\.state\./g,'.data.').replace(/\.setState\(/g,'.setData('),err=>{
  if(err) return console.error(err);
  console.log(process.argv[2].split('.')[0]+'.js')
})
