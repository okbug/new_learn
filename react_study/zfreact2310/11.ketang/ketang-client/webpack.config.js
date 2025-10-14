const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
module.exports = {
    mode:process.env.NODE_ENV==='production'?'production':'development',//指定开发模式
    entry:'./src/index.tsx',//指定入口文件
    devtool:'source-map',//生成sourcemap方法代码调试
    output:{
        path:path.resolve(__dirname,'dist'),
        filename:'bundle.js',
        assetModuleFilename:'images/[hash][ext][query]',//images/xxxyyy.jpg?size=64
        publicPath:'/'//引定引入资源文件的路径前缀
    },
    resolve:{
        extensions:['.tsx','.ts','.js'],//指定文件的扩展名
        alias:{//指定文件的别名
            '@':path.resolve(__dirname,'src')
        },
        fallback: { "buffer": false, "util": false, "stream": false,"crypto": false }
    },
    module:{
        rules:[
            {
                test:/\.tsx?$/,
                use:'ts-loader',
                exclude:/node_modules/
            },
            {
                test:/\.css$/,
                use:['style-loader','css-loader','postcss-loader'],
            },
            {
                test:/\.less$/,
                use:['style-loader','css-loader','postcss-loader','less-loader'],
            },
            {
                test:/\.(jpg|png|gif|jpeg|bmp|svg)$/,
                type:'asset',
                parser:{
                    //如果图片体积小于8K的话变会转成base64字符串，如果大于8K则会生成单独的文件到输出目录
                    dataUrlCondition:{
                        maxSize:8*1024
                    }
                }
            }
        ]
    },
    plugins:[
        new HtmlWebpackPlugin({
            template:'./src/index.html'
        }),
        new CopyWebpackPlugin({
            patterns:[
                {
                    from:path.resolve(__dirname,'public'),
                    to:path.resolve(__dirname,'dist')
                }
            ]
        })
    ],
    devServer:{
        hot:true,//启用热更新
        historyApiFallback:true,//启动把404重新定向向index.html里
        static:{//把当前目录下面的public目录作为静态文件根目录
            directory:path.join(__dirname,'public')
        }
    }
}