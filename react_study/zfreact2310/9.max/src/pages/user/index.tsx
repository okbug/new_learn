
import {PageContainer} from '@ant-design/pro-components';
import {Outlet} from '@umijs/max';
export default function(){
    return (
        <PageContainer>
            <Outlet/>
        </PageContainer>
    )
}