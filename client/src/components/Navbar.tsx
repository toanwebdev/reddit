import { gql, Reference } from '@apollo/client'
import { Box, Button, Flex, Heading, Link } from '@chakra-ui/react'
import NextLink from 'next/link'
import { MeDocument, MeQuery, useLogoutMutation, useMeQuery } from '../generated/graphql'

const Navbar = () => {
	const { data, loading: meLoading } = useMeQuery()
	const [logoutUser, { loading: logoutLoading }] = useLogoutMutation()

	const logout = async () => {
		await logoutUser({ update(cache, { data }) {
      if(data?.logout) {
        cache.writeQuery<MeQuery>({
          query: MeDocument,
          data: {me: null}
        })

				cache.modify({
					fields: {
						posts(existing) {
							existing.paginatedPosts.forEach((post: Reference) => {
								cache.writeFragment({
									id: post.__ref, // 'Post: 17'
									fragment: gql`
										fragment VoteType on Post {
											voteType
										}
									`,
									data: {
										voteType: 0
									}
								})
							})

							return existing
						}
					}
				})
      }
    } })
	}

	let body

	if (meLoading) {
		body = null
	} else if (!data?.me) {
		body = (
			<>
				<NextLink href='/login'>
					<Link mr={2}>Login</Link>
				</NextLink>
				<NextLink href='/register'>
					<Link>Register</Link>
				</NextLink>
			</>
		)
	} else {
		body = (
			<Flex>
				<NextLink href='/create-post'>
					<Button mr={4}>Create Post</Button>
				</NextLink>
				<Button onClick={logout} isLoading={logoutLoading}>
					Logout
				</Button>
			</Flex>
		)
	}

	return (
		<Box p={4} bg='tan'>
			<Flex
				maxW={800}
				justifyContent='space-between'
				alignItems='center'
				m='auto'>
				<NextLink href='/'>
					<Heading>Reddit</Heading>
				</NextLink>
				<Box>{body}</Box>
			</Flex>
		</Box>
	)
}

export default Navbar
