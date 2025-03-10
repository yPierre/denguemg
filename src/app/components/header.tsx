"use client";

import Image from 'next/image';

const Header: React.FC = () => {
    return(
        <header className="header">
            <div className="logo-component">
                <Image
                    src="/logo3.png" // Caminho da imagem na pasta public
                    alt="Logo DengueMG"
                    width={40} // Largura da imagem
                    height={40} // Altura da imagem
                    className="logo"
                />
                <span className="site-name">DengueMG</span>
            </div>
            <span className="header-title">
                <span className="full-title">Painel de Monitoramento da Dengue em Minas Gerais</span>
                <span className="short-title">Painel Dengue</span>
            </span>
        </header>
    )
}

export default Header;