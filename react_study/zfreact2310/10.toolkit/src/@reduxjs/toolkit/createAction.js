/**
 * 接收一个action类型的字符串作为参数，并返回一个使用该类型字符串的actionCreator函数
 */
function createAction(type,prepareAction){
    function actionCreator(payload){
        if(prepareAction){
            const preparedAction = prepareAction.call(null,payload);
            return {
                type,
                ...preparedAction
            }
        }
        return {
            type,
            payload
        }
    }
    actionCreator.toString = ()=>type;
    actionCreator.type = type;
    return actionCreator;
}
export default createAction;