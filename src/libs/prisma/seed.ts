import { createHash } from "crypto"
import { prisma } from "@/libs"
import { TipoUsuario, StatusCotacao } from "@/libs/prisma"

async function main() {
  console.log("🌱 Iniciando seed do Portal de Cotações...")

  // Limpar dados existentes
  await prisma.itemPedido.deleteMany()
  await prisma.pedido.deleteMany()
  await prisma.itemCotacao.deleteMany()
  await prisma.respostaCotacao.deleteMany()
  await prisma.cotacao.deleteMany()
  await prisma.produto.deleteMany()
  await prisma.fornecedor.deleteMany()
  await prisma.usuario.deleteMany()

  console.log("🗑️  Dados anteriores removidos")

  // Hash para senhas
  const senhaHash = createHash("sha256").update("123456").digest("hex")

  // 1. Criar Usuários
  console.log("👥 Criando usuários...")

  const admin = await prisma.usuario.create({
    data: {
      nome: "Administrador Sistema",
      email: "admin@portal.com",
      senha: senhaHash,
      tipo_usuario: TipoUsuario.ADMIN,
    },
  })

  const cliente1 = await prisma.usuario.create({
    data: {
      nome: "Hospital São Lucas",
      email: "compras@hospitalsaolucas.com",
      senha: senhaHash,
      tipo_usuario: TipoUsuario.CLIENT,
    },
  })

  const cliente2 = await prisma.usuario.create({
    data: {
      nome: "Clínica Médica Central",
      email: "suprimentos@clinicacentral.com",
      senha: senhaHash,
      tipo_usuario: TipoUsuario.CLIENT,
    },
  })

  const cliente3 = await prisma.usuario.create({
    data: {
      nome: "UBS Vila Nova",
      email: "gestao@ubsvilanova.gov.br",
      senha: senhaHash,
      tipo_usuario: TipoUsuario.CLIENT,
    },
  })

  // 2. Criar Fornecedores
  console.log("🏢 Criando fornecedores...")

  const fornecedor1 = await prisma.fornecedor.create({
    data: {
      nome: "MedSupply Ltda",
      contato: "vendas@medsupply.com.br | (11) 3333-4444",
    },
  })

  const fornecedor2 = await prisma.fornecedor.create({
    data: {
      nome: "Hospital Equipment Corp",
      contato: "comercial@hospequip.com.br | (11) 5555-6666",
    },
  })

  const fornecedor3 = await prisma.fornecedor.create({
    data: {
      nome: "Pharma Distribuidora",
      contato: "cotacoes@pharmadist.com.br | (11) 7777-8888",
    },
  })

  const fornecedor4 = await prisma.fornecedor.create({
    data: {
      nome: "Medical Solutions Brasil",
      contato: "atendimento@medsolutions.com.br | (11) 9999-0000",
    },
  })

  // 3. Criar Produtos Médicos e Hospitalares
  console.log("💊 Criando produtos...")

  const produtos = await Promise.all([
    // Equipamentos Médicos
    prisma.produto.create({
      data: {
        nome_produto: "Oxímetro de Pulso Digital",
        descricao: "Oxímetro portátil para medição de saturação de oxigênio e frequência cardíaca",
        estoque: 150,
      },
    }),
    prisma.produto.create({
      data: {
        nome_produto: "Termômetro Digital Infravermelho",
        descricao: "Termômetro sem contato para medição de temperatura corporal",
        estoque: 200,
      },
    }),
    prisma.produto.create({
      data: {
        nome_produto: "Esfigmomanômetro Aneróide",
        descricao: "Aparelho de pressão arterial manual profissional",
        estoque: 80,
      },
    }),
    prisma.produto.create({
      data: {
        nome_produto: "Estetoscópio Duplo",
        descricao: "Estetoscópio clínico para ausculta cardíaca e pulmonar",
        estoque: 120,
      },
    }),

    // Materiais Descartáveis
    prisma.produto.create({
      data: {
        nome_produto: "Luvas Descartáveis Nitrilo",
        descricao: "Caixa com 100 unidades - Tamanho M",
        estoque: 500,
      },
    }),
    prisma.produto.create({
      data: {
        nome_produto: "Máscara Cirúrgica Tripla Camada",
        descricao: "Caixa com 50 unidades - Descartável",
        estoque: 1000,
      },
    }),
    prisma.produto.create({
      data: {
        nome_produto: "Seringa Descartável 10ml",
        descricao: "Seringa estéril com agulha - Pacote com 100 unidades",
        estoque: 300,
      },
    }),
    prisma.produto.create({
      data: {
        nome_produto: "Gaze Estéril 7,5x7,5cm",
        descricao: "Compressa de gaze estéril - Pacote com 10 unidades",
        estoque: 800,
      },
    }),

    // Medicamentos
    prisma.produto.create({
      data: {
        nome_produto: "Dipirona Sódica 500mg",
        descricao: "Analgésico e antitérmico - Caixa com 20 comprimidos",
        estoque: 250,
      },
    }),
    prisma.produto.create({
      data: {
        nome_produto: "Paracetamol 750mg",
        descricao: "Analgésico e antitérmico - Caixa com 20 comprimidos",
        estoque: 300,
      },
    }),
    prisma.produto.create({
      data: {
        nome_produto: "Soro Fisiológico 0,9% 500ml",
        descricao: "Solução salina estéril para uso intravenoso",
        estoque: 400,
      },
    }),

    // Equipamentos Hospitalares
    prisma.produto.create({
      data: {
        nome_produto: "Cama Hospitalar Manual",
        descricao: "Cama hospitalar com grades laterais e rodízios",
        estoque: 15,
      },
    }),
    prisma.produto.create({
      data: {
        nome_produto: "Cadeira de Rodas Dobrável",
        descricao: "Cadeira de rodas em aço com assento em nylon",
        estoque: 25,
      },
    }),
    prisma.produto.create({
      data: {
        nome_produto: "Suporte para Soro Móvel",
        descricao: "Suporte em aço inox com 4 ganchos e rodízios",
        estoque: 40,
      },
    }),
    prisma.produto.create({
      data: {
        nome_produto: "Monitor de Sinais Vitais",
        descricao: "Monitor multiparamétrico para pressão, oximetria e ECG",
        estoque: 8,
      },
    }),
  ])

  // 4. Criar Cotações com diferentes status
  console.log("📋 Criando cotações...")

  // Cotação 1: PENDENTE - Hospital São Lucas
  const cotacao1 = await prisma.cotacao.create({
    data: {
      id_cliente: cliente1.id_usuario,
      status: StatusCotacao.PENDENTE,
      data_solicitacao: new Date("2024-06-20T09:00:00"),
    },
  })

  // Itens da cotação 1
  await Promise.all([
    prisma.itemCotacao.create({
      data: {
        id_cotacao: cotacao1.id_cotacao,
        id_produto: produtos[0].id_produto, // Oxímetro
        quantidade: 10,
      },
    }),
    prisma.itemCotacao.create({
      data: {
        id_cotacao: cotacao1.id_cotacao,
        id_produto: produtos[4].id_produto, // Luvas
        quantidade: 50,
      },
    }),
    prisma.itemCotacao.create({
      data: {
        id_cotacao: cotacao1.id_cotacao,
        id_produto: produtos[5].id_produto, // Máscaras
        quantidade: 100,
      },
    }),
  ])

  // Cotação 2: RESPONDIDA - Clínica Central
  const cotacao2 = await prisma.cotacao.create({
    data: {
      id_cliente: cliente2.id_usuario,
      status: StatusCotacao.RESPONDIDA,
      data_solicitacao: new Date("2024-06-18T14:30:00"),
    },
  })

  // Itens da cotação 2
  await Promise.all([
    prisma.itemCotacao.create({
      data: {
        id_cotacao: cotacao2.id_cotacao,
        id_produto: produtos[1].id_produto, // Termômetro
        quantidade: 5,
      },
    }),
    prisma.itemCotacao.create({
      data: {
        id_cotacao: cotacao2.id_cotacao,
        id_produto: produtos[2].id_produto, // Esfigmomanômetro
        quantidade: 3,
      },
    }),
    prisma.itemCotacao.create({
      data: {
        id_cotacao: cotacao2.id_cotacao,
        id_produto: produtos[3].id_produto, // Estetoscópio
        quantidade: 8,
      },
    }),
  ])

  // Respostas para cotação 2
  await Promise.all([
    prisma.respostaCotacao.create({
      data: {
        id_cotacao: cotacao2.id_cotacao,
        id_fornecedor: fornecedor1.id_fornecedor,
        preco_unitario: 450.00,
        prazo_entrega: "7 dias úteis",
      },
    }),
    prisma.respostaCotacao.create({
      data: {
        id_cotacao: cotacao2.id_cotacao,
        id_fornecedor: fornecedor2.id_fornecedor,
        preco_unitario: 425.00,
        prazo_entrega: "10 dias úteis",
      },
    }),
  ])

  // Cotação 3: PENDENTE - UBS Vila Nova
  const cotacao3 = await prisma.cotacao.create({
    data: {
      id_cliente: cliente3.id_usuario,
      status: StatusCotacao.PENDENTE,
      data_solicitacao: new Date("2024-06-25T10:15:00"),
    },
  })

  // Itens da cotação 3
  await Promise.all([
    prisma.itemCotacao.create({
      data: {
        id_cotacao: cotacao3.id_cotacao,
        id_produto: produtos[8].id_produto, // Dipirona
        quantidade: 20,
      },
    }),
    prisma.itemCotacao.create({
      data: {
        id_cotacao: cotacao3.id_cotacao,
        id_produto: produtos[9].id_produto, // Paracetamol
        quantidade: 30,
      },
    }),
    prisma.itemCotacao.create({
      data: {
        id_cotacao: cotacao3.id_cotacao,
        id_produto: produtos[10].id_produto, // Soro Fisiológico
        quantidade: 50,
      },
    }),
  ])

  // Cotação 4: RESPONDIDA - Hospital São Lucas (equipamentos hospitalares)
  const cotacao4 = await prisma.cotacao.create({
    data: {
      id_cliente: cliente1.id_usuario,
      status: StatusCotacao.RESPONDIDA,
      data_solicitacao: new Date("2024-06-15T16:45:00"),
    },
  })

  // Itens da cotação 4
  await Promise.all([
    prisma.itemCotacao.create({
      data: {
        id_cotacao: cotacao4.id_cotacao,
        id_produto: produtos[11].id_produto, // Cama Hospitalar
        quantidade: 5,
      },
    }),
    prisma.itemCotacao.create({
      data: {
        id_cotacao: cotacao4.id_cotacao,
        id_produto: produtos[13].id_produto, // Suporte para Soro
        quantidade: 10,
      },
    }),
  ])

  // Respostas para cotação 4 (múltiplas respostas de diferentes fornecedores)
  await Promise.all([
    prisma.respostaCotacao.create({
      data: {
        id_cotacao: cotacao4.id_cotacao,
        id_fornecedor: fornecedor2.id_fornecedor,
        preco_unitario: 2800.00,
        prazo_entrega: "15 dias úteis",
      },
    }),
    prisma.respostaCotacao.create({
      data: {
        id_cotacao: cotacao4.id_cotacao,
        id_fornecedor: fornecedor4.id_fornecedor,
        preco_unitario: 2650.00,
        prazo_entrega: "20 dias úteis",
      },
    }),
    prisma.respostaCotacao.create({
      data: {
        id_cotacao: cotacao4.id_cotacao,
        id_fornecedor: fornecedor3.id_fornecedor,
        preco_unitario: 2900.00,
        prazo_entrega: "12 dias úteis",
      },
    }),
  ])

  // Cotação 5: CANCELADA
  const cotacao5 = await prisma.cotacao.create({
    data: {
      id_cliente: cliente2.id_usuario,
      status: StatusCotacao.CANCELADA,
      data_solicitacao: new Date("2024-06-10T11:20:00"),
    },
  })

  await prisma.itemCotacao.create({
    data: {
      id_cotacao: cotacao5.id_cotacao,
      id_produto: produtos[14].id_produto, // Monitor de Sinais Vitais
      quantidade: 2,
    },
  })

  // 5. Criar Pedidos baseados em cotações respondidas
  console.log("🛒 Criando pedidos...")

  // Pedido 1: Baseado na cotação 2 (Clínica Central)
  const pedido1 = await prisma.pedido.create({
    data: {
      id_cliente: cliente2.id_usuario,
      valor_total: 3825.00, // (450*5) + (425*3) + (350*8)
      data_pedido: new Date("2024-06-19T09:30:00"),
    },
  })

  await Promise.all([
    prisma.itemPedido.create({
      data: {
        id_pedido: pedido1.id_pedido,
        id_produto: produtos[1].id_produto, // Termômetro
        quantidade: 5,
        valor_unitario: 450.00,
      },
    }),
    prisma.itemPedido.create({
      data: {
        id_pedido: pedido1.id_pedido,
        id_produto: produtos[2].id_produto, // Esfigmomanômetro
        quantidade: 3,
        valor_unitario: 425.00,
      },
    }),
    prisma.itemPedido.create({
      data: {
        id_pedido: pedido1.id_pedido,
        id_produto: produtos[3].id_produto, // Estetoscópio
        quantidade: 8,
        valor_unitario: 350.00,
      },
    }),
  ])

  // Pedido 2: Hospital São Lucas
  const pedido2 = await prisma.pedido.create({
    data: {
      id_cliente: cliente1.id_usuario,
      valor_total: 1850.00,
      data_pedido: new Date("2024-06-22T15:45:00"),
    },
  })

  await Promise.all([
    prisma.itemPedido.create({
      data: {
        id_pedido: pedido2.id_pedido,
        id_produto: produtos[4].id_produto, // Luvas
        quantidade: 20,
        valor_unitario: 25.00,
      },
    }),
    prisma.itemPedido.create({
      data: {
        id_pedido: pedido2.id_pedido,
        id_produto: produtos[5].id_produto, // Máscaras
        quantidade: 50,
        valor_unitario: 18.00,
      },
    }),
    prisma.itemPedido.create({
      data: {
        id_pedido: pedido2.id_pedido,
        id_produto: produtos[6].id_produto, // Seringas
        quantidade: 15,
        valor_unitario: 45.00,
      },
    }),
  ])

  // Pedido 3: UBS Vila Nova (medicamentos)
  const pedido3 = await prisma.pedido.create({
    data: {
      id_cliente: cliente3.id_usuario,
      valor_total: 2100.00,
      data_pedido: new Date("2024-06-26T08:20:00"),
    },
  })

  await Promise.all([
    prisma.itemPedido.create({
      data: {
        id_pedido: pedido3.id_pedido,
        id_produto: produtos[8].id_produto, // Dipirona
        quantidade: 25,
        valor_unitario: 12.50,
      },
    }),
    prisma.itemPedido.create({
      data: {
        id_pedido: pedido3.id_pedido,
        id_produto: produtos[9].id_produto, // Paracetamol
        quantidade: 30,
        valor_unitario: 15.80,
      },
    }),
    prisma.itemPedido.create({
      data: {
        id_pedido: pedido3.id_pedido,
        id_produto: produtos[10].id_produto, // Soro Fisiológico
        quantidade: 80,
        valor_unitario: 22.50,
      },
    }),
  ])

  console.log("✅ Seed concluído com sucesso!")
  console.log("📊 Dados criados:")
  console.log(`   👥 ${await prisma.usuario.count()} usuários`)
  console.log(`   🏢 ${await prisma.fornecedor.count()} fornecedores`)
  console.log(`   💊 ${await prisma.produto.count()} produtos`)
  console.log(`   📋 ${await prisma.cotacao.count()} cotações`)
  console.log(`   💬 ${await prisma.respostaCotacao.count()} respostas de cotação`)
  console.log(`   🛒 ${await prisma.pedido.count()} pedidos`)
  console.log("")
  console.log("👤 Usuários de teste:")
  console.log("   Admin: admin@portal.com | senha: 123456")
  console.log("   Cliente 1: compras@hospitalsaolucas.com | senha: 123456")
  console.log("   Cliente 2: suprimentos@clinicacentral.com | senha: 123456")
  console.log("   Cliente 3: gestao@ubsvilanova.gov.br | senha: 123456")
}

main()
  .catch((e) => {
    console.error("❌ Erro durante o seed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })