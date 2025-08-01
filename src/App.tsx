import { JSX } from 'react';
import { MemoryRouter } from 'react-router-dom';
import Navbar from './components/navbar/Navbar';
import Routers from './components/routes/Routers';
import AlertProvider from './providers/AlertProvider';
import { Alert } from './components/elements';


export default function App(): JSX.Element {	
	return (
		<div 
			className='
				w-full 
				h-full
				relative
			'
		>
			<AlertProvider>
				<MemoryRouter>
					<Navbar />
					<Routers />
					<Alert />
				</MemoryRouter>
			</AlertProvider>
		</div>
	);
};