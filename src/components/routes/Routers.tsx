import { JSX } from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './Home';
import Login from './Login';
import SelectOption from './SelectOption';
import SelectResult from './selectResult/SelectResult';
import Extract from './Extract';
import { Footer, Header } from '../elements';


export default function Routers(): JSX.Element {
    return (
        <div className='min-h-screen'>
            <Header />

            <div 
                className='
                    bg-white
                    pt-10
                    pb-[74px]
                    overflow-hidden
                '
            >
                <div 
                    className='
                        mx-auto 
                        max-w-2xl 
                    '
                >
                    <Routes>
                        <Route 
                            path='/' 
                            element={<Home />} 
                        />
                    </Routes>

                    <Routes>
                        <Route 
                            path='/login' 
                            element={<Login />} 
                        />
                    </Routes>

                    <Routes>
                        <Route 
                            path='/select-option' 
                            element={<SelectOption />} 
                        />
                    </Routes>

                    <Routes>
                        <Route 
                            path='/select-result' 
                            element={<SelectResult />} 
                        />
                    </Routes>

                    <Routes>
                        <Route 
                            path='/extract' 
                            element={<Extract />} 
                        />
                    </Routes>
                </div>
            </div>

            <Footer />
        </div>
    )
}