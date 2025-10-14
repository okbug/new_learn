let valueStack = [];
{
    let a=2;
    valueStack.push(a);
    {
        a=3;
        valueStack.push(a);
        {
            a=4;
            valueStack.push(a);
            console.log(a)
            valueStack.pop();
        }
        a=valueStack[valueStack.length-1]
        console.log(a)
        valueStack.pop();
    }
    a=valueStack[valueStack.length-1]
    console.log(a)
}